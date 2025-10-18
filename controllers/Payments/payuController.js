import crypto from "crypto";
import Order from "../../model/OrderModel.js";
import Cart from "../../model/CartModel.js";
import User from "../../model/UserModel.js";

// PayU environment configuration from .env
const PAYU_KEY = process.env.PAYU_MERCHANT_KEY || "";
const PAYU_SALT = process.env.PAYU_MERCHANT_SALT || "";
const PAYU_BASE_URL = process.env.PAYU_BASE_URL || "https://test.payu.in"; // sandbox by default
const PAYU_SUCCESS_URL =
	process.env.PAYU_SUCCESS_URL ||
	`${process.env.API_URL}/api/payments/payu/callback`;
const PAYU_FAILURE_URL =
	process.env.PAYU_FAILURE_URL ||
	`${process.env.API_URL}/api/payments/payu/callback`;

// Verify endpoint differs from _payment; pick default based on env if not provided
const PAYU_VERIFY_URL =
	process.env.PAYU_VERIFY_URL ||
	(PAYU_BASE_URL.includes("test")
		? "https://test.payu.in/merchant/postservice?form=2"
		: "https://info.payu.in/merchant/postservice?form=2");

const hashSequence = [
	"key",
	"txnid",
	"amount",
	"productinfo",
	"firstname",
	"email",
	"udf1",
	"udf2",
	"udf3",
	"udf4",
	"udf5",
	"udf6",
	"udf7",
	"udf8",
	"udf9",
	"udf10",
];

function sha512(str) {
	return crypto.createHash("sha512").update(str).digest("hex");
}

function buildTxnId() {
	return `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

// Build the PayU request hash
function buildRequestHash(fields) {
	const values = hashSequence.map((k) => fields[k] || "");
	const toHash = values.join("|") + "|" + PAYU_SALT;
	return sha512(toHash);
}

// Build the PayU response hash (reverse order with salt ahead of status)
function buildResponseHash(resp) {
	// As per PayU: hash = sha512(salt|status||||||||udf10|...|udf1|email|firstname|productinfo|amount|txnid|key)
	const baseParts = [
		PAYU_SALT,
		resp.status || "",
		resp.udf10 || "",
		resp.udf9 || "",
		resp.udf8 || "",
		resp.udf7 || "",
		resp.udf6 || "",
		resp.udf5 || "",
		resp.udf4 || "",
		resp.udf3 || "",
		resp.udf2 || "",
		resp.udf1 || "",
		resp.email || "",
		resp.firstname || "",
		resp.productinfo || "",
		resp.amount || "",
		resp.txnid || "",
		resp.key || "",
	];
	const base = baseParts.join("|");
	// If additionalCharges is present, it should be prefixed to the hash string
	const toHash = resp.additionalCharges
		? `${resp.additionalCharges}|${base}`
		: base;
	return sha512(toHash);
}

// Normalize PayU mode to our order.paymentMethod enum
function mapPayUModeToPaymentMethod(mode) {
	const m = String(mode || "").toUpperCase();
	if (m === "CC" || m === "DC" || m === "EMI") return "card";
	if (m === "NB") return "netbanking";
	if (m === "UPI") return "upi";
	if (m === "WALLET") return "wallet";
	if (m === "COD" || m === "CASH") return "cod";
	// Unknown/empty: leave as-is or fallback to pending
	return "pending";
}

// POST /api/payments/payu/initiate
export const initiatePayU = async (req, res) => {
	try {
		const userId = req.user._id;

		// Step 0: Env guard + log
		if (!PAYU_KEY || !PAYU_SALT) {
			console.error(
				"[PayU][initiate][error] Missing PAYU_MERCHANT_KEY or PAYU_MERCHANT_SALT"
			);
			return res.status(500).json({
				success: false,
				message: "Payment gateway not configured. Please contact support.",
			});
		}
		console.log("[PayU][initiate][start]", { userId: String(userId) });

		// Ensure cart-only purchase: load cart for this user
		const cart = await Cart.findOne({ userId });
		if (!cart || !cart.items || cart.items.length === 0) {
			return res
				.status(400)
				.json({ success: false, message: "Your cart is empty." });
		}
		console.log("[PayU][initiate][cart]", { items: cart.items.length });

		// Build order items from server-side data to avoid client tampering
		let totalAmount = 0;
		const orderItems = cart.items.map((ci) => {
			totalAmount += Number(ci.price || 0) * Number(ci.quantity || 1);
			const upperType = ci.itemType;
			// Map cart item types to order item types
			// Cart uses [Course, Book, Consultation, Service]
			// Order expects itemType in [course, book, package, service]
			let itemType = "";
			if (upperType === "Course") itemType = "course";
			else if (upperType === "Book") itemType = "book";
			else if (upperType === "Service") itemType = "service";
			else if (upperType === "Consultation") itemType = "package";

			let itemModel = "";
			if (upperType === "Course") itemModel = "Course";
			else if (upperType === "Book") itemModel = "Book";
			else if (upperType === "Service") itemModel = "Service";
			else if (upperType === "Consultation") itemModel = "Consultation";

			return {
				itemType,
				itemId: ci.itemId,
				itemModel,
				title: ci.title,
				price: ci.price,
				quantity: ci.quantity || 1,
				image: ci.image,
			};
		});

		if (!totalAmount || totalAmount <= 0) {
			return res
				.status(400)
				.json({ success: false, message: "Invalid cart total." });
		}
		console.log("[PayU][initiate][cart-total]", {
			totalAmount: Number(totalAmount.toFixed(2)),
		});

		// Create server-side order with pending payment
		const order = await Order.create({
			user: userId,
			items: orderItems,
			totalAmount: Number(totalAmount.toFixed(2)),
			paymentMethod: "pending",
			paymentStatus: "pending",
			statusHistory: [
				{ status: "pending", updatedBy: userId, timestamp: new Date() },
			],
		});
		console.log("[PayU][initiate][order-created]", {
			orderId: String(order._id),
			orderNumber: order.orderNumber,
			amount: Number(order.totalAmount).toFixed(2),
		});

		// Build PayU payload
		const txnid = buildTxnId();
		const amount = Number(order.totalAmount).toFixed(2);

		const user = await User.findById(userId);
		const productinfo = `Order ${order.orderNumber || order._id}`;
		console.log("[PayU][initiate][txnid]", { txnid });

		// Append order id to surl/furl to help GET return include context
		const appendQS = (url, kv) =>
			url.includes("?") ? `${url}&${kv}` : `${url}?${kv}`;
		const surlFinal = appendQS(
			PAYU_SUCCESS_URL,
			`order=${encodeURIComponent(String(order._id))}`
		);
		const furlFinal = appendQS(
			PAYU_FAILURE_URL,
			`order=${encodeURIComponent(String(order._id))}`
		);

		const fields = {
			key: PAYU_KEY,
			txnid,
			amount,
			productinfo,
			firstname: user?.name || "",
			email: user?.email || "",
			phone: user?.phone || "",
			surl: surlFinal,
			furl: furlFinal,
			// Pass order id for reconciliation in udf1
			udf1: String(order._id),
			udf2: "",
			udf3: "",
			udf4: "",
			udf5: "",
			udf6: "",
			udf7: "",
			udf8: "",
			udf9: "",
			udf10: "",
			// service_provider is a legacy/optional field for some older integrations; safe to omit for hosted checkout
			// service_provider: "payu_paisa",
		};

		const hash = buildRequestHash(fields);
		console.log("[PayU][initiate][hash]", {
			computed: Boolean(hash),
			length: hash?.length,
		});

		// Optional: clear cart now or after successful payment; we keep it until paid to be safe
		// await Cart.findOneAndUpdate({ userId }, { items: [] });

		// Persist our merchant txnid on the order so we can verify later if needed
		try {
			order.transactionId = txnid; // merchant txn id (will be replaced by mihpayid on success)
			await order.save();
		} catch {}

		// Set a short-lived cookie with orderId to help our GET callback correlate if PayU doesn't pass query params
		try {
			res.cookie("payu_last_order", String(order._id), {
				maxAge: 15 * 60 * 1000, // 15 minutes
				httpOnly: true,
				secure: true, // required for SameSite=None on https (ngrok/prod)
				sameSite: "none",
				path: "/",
			});
		} catch {}

		console.log("[PayU][initiate][sent]", {
			orderId: String(order._id),
			txnid,
		});
		res.status(200).json({
			success: true,
			data: {
				payuUrl: `${PAYU_BASE_URL}/_payment`,
				params: { ...fields, hash },
			},
		});
	} catch (err) {
		console.error("[PayU][initiate][error]", err?.message || err);
		res.status(500).json({
			success: false,
			message: err.message || "Failed to initiate payment",
		});
	}
};

// GET /api/payments/payu/verify-order/:orderId
// Fallback: Verify payment status with PayU using merchant txnid (txnid)
export const verifyOrderWithPayU = async (req, res) => {
	try {
		const userId = req.user?._id;
		const { orderId } = req.params;
		if (!orderId) {
			return res
				.status(400)
				.json({ success: false, message: "orderId is required" });
		}
		console.log("[PayU][verify][start]", { orderId });

		const order = await Order.findById(orderId);
		if (!order)
			return res
				.status(404)
				.json({ success: false, message: "Order not found" });
		// Ensure the requester owns the order (or is admin via upstream middleware)
		if (userId && String(order.user) !== String(userId)) {
			return res.status(403).json({ success: false, message: "Forbidden" });
		}

		const txnid = order.transactionId; // We stored our merchant txn id here in initiate
		if (!txnid) {
			return res
				.status(400)
				.json({ success: false, message: "Order missing merchant txn id" });
		}

		const command = "verify_payment";
		const var1 = txnid;
		const verifyHash = sha512(`${PAYU_KEY}|${command}|${var1}|${PAYU_SALT}`);
		console.log("[PayU][verify][request]", {
			command,
			var1: txnid,
			url: PAYU_VERIFY_URL,
		});

		// Call PayU verify API
		const body = new URLSearchParams({
			key: PAYU_KEY,
			command,
			var1,
			hash: verifyHash,
		});

		// Use global fetch (Node 18+) - if not available, user should upgrade Node or we can polyfill later
		const resp = await fetch(PAYU_VERIFY_URL, {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body,
		});
		const text = await resp.text();
		let data;
		try {
			data = JSON.parse(text);
		} catch {
			data = { raw: text };
		}

		// Extract status from response
		let payuStatus = undefined;
		let payuDetails = undefined;
		if (data?.transaction_details) {
			const td =
				data.transaction_details[var1] ||
				data.transaction_details[var1.toString()];
			payuDetails = td;
			payuStatus = td?.status;
		}
		console.log("[PayU][verify][response]", {
			payuStatus,
			hasDetails: Boolean(payuDetails),
		});

		// Update order based on verify result if it provides a definitive state
		if (payuStatus === "success") {
			order.paymentStatus = "paid";
			if (order.status !== "accepted" && order.status !== "completed") {
				order.status = "accepted";
				order.statusHistory.push({
					status: "accepted",
					timestamp: new Date(),
					notes: "Verified via PayU",
				});
			}
			await order.save();
		} else if (payuStatus === "failure") {
			order.paymentStatus = "failed";
			if (order.status !== "declined") {
				order.status = "declined";
				order.statusHistory.push({
					status: "declined",
					timestamp: new Date(),
					notes: "Verified via PayU",
				});
			}
			await order.save();
		}

		return res.status(200).json({
			success: true,
			data: { verifyUrl: PAYU_VERIFY_URL, response: data, payuStatus },
		});
	} catch (err) {
		console.error("[PayU][verify][error]", err?.message || err);
		return res
			.status(500)
			.json({ success: false, message: err.message || "Verification failed" });
	}
};

// POST /api/payments/payu/callback
export const payUCallback = async (req, res) => {
	try {
		const resp = req.body || {};
		// Entry log: confirm callback is hit and capture request meta
		try {
			const ip =
				req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
				req.socket?.remoteAddress ||
				"";
			console.log("[PayU][POST callback][hit]", {
				ip,
				contentType: req.headers["content-type"],
				userAgent: req.headers["user-agent"],
			});
		} catch {}
		const {
			status,
			hash: receivedHash,
			mihpayid,
			txnid,
			mode,
			amount,
			productinfo,
			firstname,
			email,
			udf1, // orderId
			error_Message,
		} = resp;

		// Optional detailed payload logging (dev only). Enable with PAYU_DEBUG_LOG=1
		try {
			if (process.env.PAYU_DEBUG_LOG === "1") {
				const maskEmail = (v) =>
					v ? String(v).replace(/(^.).*(@.*$)/, "$1***$2") : v;
				const maskPhone = (v) => (v ? String(v).replace(/.(?=.{4})/g, "*") : v);
				const summary = {
					status,
					key: resp.key,
					txnid,
					mihpayid,
					amount,
					productinfo,
					firstname,
					email: maskEmail(email),
					phone: maskPhone(resp.phone),
					udf1: resp.udf1,
					udf2: resp.udf2,
					udf3: resp.udf3,
					udf4: resp.udf4,
					udf5: resp.udf5,
					PG_TYPE: resp.PG_TYPE,
					bankcode: resp.bankcode,
					bank_ref_num: resp.bank_ref_num,
					field1: resp.field1,
					field9: resp.field9,
				};
				console.log("[PayU][POST callback][payload-summary]", summary);
				// Also log all keys received (for completeness)
				try {
					console.log("[PayU][POST callback][keys]", Object.keys(resp));
				} catch {}
			}
		} catch {}

		// Verify response hash
		const expectedHash = buildResponseHash(resp);
		const isValid =
			(receivedHash || "").toLowerCase() === expectedHash.toLowerCase();

		// Safe diagnostic logging
		try {
			const ip =
				req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
				req.socket?.remoteAddress ||
				"";
			const maskedEmail = (email || "").replace(/(^.).*(@.*$)/, "$1***$2");
			console.log("[PayU][POST callback]", {
				ip,
				txnid,
				mihpayid,
				status,
				orderId: udf1,
				amount,
				mode,
				email: maskedEmail,
				hashValid: isValid,
			});
		} catch {}

		if (!isValid) {
			console.error("PayU hash mismatch", {
				txnid,
				receivedHash,
				expectedHash,
			});
			return res
				.status(400)
				.json({ success: false, message: "Hash verification failed" });
		}

		// Find order
		const orderId = udf1;
		const order = await Order.findById(orderId);
		if (!order) {
			return res
				.status(404)
				.json({ success: false, message: "Order not found" });
		}

		// Update order based on status
		if (status === "success") {
			order.paymentStatus = "paid";
			const normalizedMethod = mapPayUModeToPaymentMethod(mode);
			order.paymentMethod = normalizedMethod || order.paymentMethod || "card";
			order.transactionId = mihpayid || txnid || order.transactionId;
			order.paidAt = new Date();
			order.status = "accepted";
			order.statusHistory.push({ status: "accepted", timestamp: new Date() });

			// Clear user's cart now that payment is successful
			await Cart.findOneAndUpdate({ userId: order.user }, { items: [] });

			// Enroll courses from this order
			try {
				const user = await User.findById(order.user);
				if (user) {
					const courseItems = (order.items || []).filter(
						(i) => i.itemType === "course"
					);
					const courseIds = courseItems.map((i) => String(i.itemId));
					const existing = new Set(
						(user.enrolledCourses || []).map((id) => String(id))
					);
					const toAdd = courseIds.filter((id) => !existing.has(id));
					if (toAdd.length) {
						user.enrolledCourses.push(...toAdd);
						await user.save();
					}
				}
			} catch (e) {
				console.error("Enrollment after payment failed", e);
			}
		} else {
			order.paymentStatus = "failed";
			order.status = "declined";
			order.statusHistory.push({
				status: "declined",
				timestamp: new Date(),
				notes: error_Message,
			});
		}

		await order.save();

		// Log order update summary
		try {
			console.log("[PayU][POST callback][order-updated]", {
				orderId: String(order._id),
				paymentStatus: order.paymentStatus,
				status: order.status,
				transactionId: order.transactionId,
			});
		} catch {}

		// Build a simple HTML page that immediately redirects the browser to the frontend
		const clientBase = process.env.CLIENT_URL || "";
		const target = clientBase
			? `${clientBase}/my-orders?payment=${encodeURIComponent(
					status
			  )}&order=${encodeURIComponent(String(order._id))}`
			: "/";
		const html = `<!doctype html>
                        <html>
                        <head>
                            <meta charset="utf-8" />
                            <meta http-equiv="refresh" content="1;url=${target}" />
                            <meta name="viewport" content="width=device-width, initial-scale=1" />
                            <title>Redirecting…</title>
                            <style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,\"Helvetica Neue\",sans-serif;padding:24px;line-height:1.6}</style>
                        </head>
                        <body>
                            <h2>Payment ${status}</h2>
                            <p>Taking you back to the merchant site… If you are not redirected automatically, <a href="${target}">click here</a>.</p>
                            <script>window.location.replace(${JSON.stringify(
															target
														)});</script>
                        </body>
                        </html>`;
		return res.status(200).send(html);
	} catch (err) {
		console.error("payUCallback error:", err);
		res.status(500).json({
			success: false,
			message: err.message || "Callback processing failed",
		});
	}
};

// GET /api/payments/payu/callback - user/browser visits (no hash). Redirect to frontend safely.
export const payUReturn = async (req, res) => {
	const clientBase = process.env.CLIENT_URL || "/";
	let status = (req.query?.status || "").toString() || "unknown";
	let order = (req.query?.order || "").toString() || "";
	try {
		const ip =
			req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
			req.socket?.remoteAddress ||
			"";
		// Use cookie fallback if PayU didn’t send order param
		if (!order && req.cookies?.payu_last_order) {
			order = req.cookies.payu_last_order;
		}
		console.log("[PayU][GET return]", {
			ip,
			status,
			order,
			hadCookie: Boolean(req.cookies?.payu_last_order),
		});
	} catch {}

	// If we have an order id but unknown status, inspect our Order to infer a user-friendly status
	if (order && (!status || status === "unknown")) {
		try {
			const ord = await Order.findById(order)
				.select("paymentStatus status")
				.lean();
			if (ord) {
				if (
					ord.paymentStatus === "paid" ||
					ord.status === "accepted" ||
					ord.status === "completed"
				) {
					status = "success";
				} else if (
					ord.paymentStatus === "failed" ||
					ord.status === "declined" ||
					ord.status === "cancelled"
				) {
					status = "failure";
				} else {
					status = "pending";
				}
			}
		} catch (e) {
			// ignore lookup errors, keep status as unknown
		}
	}
	// Build target: if we don't have meaningful status/order, send to My Orders without params
	let target = clientBase ? `${clientBase}/my-orders` : "/";
	if ((status && status !== "unknown") || order) {
		const params = new URLSearchParams();
		if (status && status !== "unknown") params.set("payment", status);
		if (order) params.set("order", order);
		if (params.toString()) target = `${target}?${params.toString()}`;
	}
	// Clear cookie so it doesn’t linger
	try {
		res.clearCookie("payu_last_order", { path: "/" });
	} catch {}
	try {
		console.log("[PayU][GET return][redirect]", { target });
	} catch {}
	return res.redirect(302, target);
};

// POST /api/payments/payu/verify  - optional server-side verification using the same fields
export const verifyPayUHash = async (req, res) => {
	try {
		const resp = req.body || {};
		const expectedHash = buildResponseHash(resp);
		const ok = (resp.hash || "").toLowerCase() === expectedHash.toLowerCase();
		res
			.status(200)
			.json({ success: ok, expectedHash, receivedHash: resp.hash });
	} catch (err) {
		res
			.status(500)
			.json({ success: false, message: err.message || "Verify failed" });
	}
};

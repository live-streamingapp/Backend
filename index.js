import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import bannerRoutes from "./routes/bannerRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import aboutRoutes from "./routes/aboutRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import ticketRoutes from "./routes/ticketroutes.js";
import adminRoutes from "./routes/adminRoute.js";
import contactRoutes from "./routes/contactRoutes.js";
import podcastRoutes from "./routes/podcastRoutes.js";
import instructorRoutes from "./routes/instructorRoutes.js";
import numerologyRoutes from "./routes/numerologyRoutes.js";
import consultationRoutes from "./routes/consultationRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import logout from "./routes/logOut.js";
import currentUser from "./routes/currentUser.js";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";
import http from "http";
import { initializeSocket } from "./utils/socket.js";
import testimonialRoutes from "./routes/testimonialRoutes.js";
import chatRouter from "./routes/chat.js";
import forumRoutes from "./routes/forumRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";
// 🆕 Session management routes
import sessionRoutes from "./routes/sessionRoutes.js";
import sessionAdminRoutes from "./routes/sessionAdminRoutes.js";

dotenv.config();

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(
	cors({
		origin: [
			"http://localhost:5173", // local dev frontend
			"https://103bec500c90.ngrok-free.app",
			process.env.CLIENT_URL, // deployed frontend
			process.env.API_URL, // deployed  backend
		], // Froned URL, * for any url
		credentials: true,
		methods: ["GET", "POST", "PUT", "DELETE"],
	})
);
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

const PORT = process.env.PORT || 3000;

connectDB();

// Swagger Documentation
app.use(
	"/docs",
	swaggerUi.serve,
	swaggerUi.setup(swaggerSpec, {
		customCss: ".swagger-ui .topbar { display: none }",
		customSiteTitle: "VastuGuru API Documentation",
	})
);

// test route
app.get("/", (req, res) => {
	res.send("Server is Active");
});

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/about", aboutRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/ticket", ticketRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/chats", chatRouter);
app.use("/api/podcasts", podcastRoutes);
app.use("/api/instructors", instructorRoutes);
app.use("/api/numerology", numerologyRoutes);
app.use("/api/consultations", consultationRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api", testimonialRoutes);
app.use("/api/logout", logout);
app.use("/api/me", currentUser);
app.use("/api/forums", forumRoutes);
app.use("/api/notifications", notificationRoutes);
// 🆕 Session routes
app.use("/api/sessions", sessionRoutes);
app.use("/api/admin", sessionAdminRoutes);

const server = http.createServer(app);
const io = initializeSocket(server);

// start server
server.listen(PORT, () => {
	console.log(`Server is running at http://localhost:${PORT}`);
});

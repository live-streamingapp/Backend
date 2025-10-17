// Utility for generating Agora RTC tokens
// Requires: npm install agora-access-token
import AgoraAccessTokenPkg from "agora-access-token";
const { RtcTokenBuilder, RtcRole } = AgoraAccessTokenPkg;

const DEFAULT_EXPIRATION_SECONDS = 4 * 60 * 60; // 4 hours

/**
 * Generate an Agora RTC token
 * @param {Object} params
 * @param {string} params.appId - Agora App ID
 * @param {string} params.appCertificate - Agora App Certificate
 * @param {string} params.channelName - Channel name
 * @param {number} [params.uid=0] - Numeric UID the token is issued for (0 allows any uid)
 * @param {"publisher"|"subscriber"} [params.role="subscriber"] - Role for privileges
 * @param {number} [params.expireSeconds=DEFAULT_EXPIRATION_SECONDS] - TTL in seconds
 * @returns {{ token: string, expireAt: Date }}
 */
export function generateRtcToken({
	appId,
	appCertificate,
	channelName,
	uid = 0,
	role = "subscriber",
	expireSeconds = DEFAULT_EXPIRATION_SECONDS,
}) {
	if (!appId || !appCertificate) {
		throw new Error(
			"Agora credentials missing: appId/appCertificate are required to generate token"
		);
	}

	const agoraRole =
		role === "publisher" ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;

	const currentTs = Math.floor(Date.now() / 1000);
	const privilegeExpireTs = currentTs + expireSeconds;

	// Use UID-based token so web SDK can join with numeric uid. Using uid=0 permits any uid.
	const token = RtcTokenBuilder.buildTokenWithUid(
		appId,
		appCertificate,
		channelName,
		uid,
		agoraRole,
		privilegeExpireTs
	);

	return {
		token,
		expireAt: new Date(privilegeExpireTs * 1000),
	};
}

/**
 * Helper to check if an existing token is expired (with small skew)
 * @param {Date|string|number} expiry
 * @param {number} [skewSeconds=60]
 */
export function isTokenExpired(expiry, skewSeconds = 60) {
	if (!expiry) return true;
	const expMs = new Date(expiry).getTime();
	return Date.now() + skewSeconds * 1000 >= expMs;
}

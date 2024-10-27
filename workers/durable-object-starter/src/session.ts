import type { SvelteAuth } from ".";
import type { User } from "./user";
import { encodeHexLowerCase, encodeBase32LowerCaseNoPadding } from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";

export interface SessionFlags {
	twoFactorVerified: boolean;
}

export interface Session extends SessionFlags {
	id: string;
	expiresAt: Date;
	userId: number;
}

type SessionValidationResult = { session: Session; user: User } | { session: null; user: null };

export function generateSessionToken(): string {
	const tokenBytes = new Uint8Array(20);
	crypto.getRandomValues(tokenBytes);
	const token = encodeBase32LowerCaseNoPadding(tokenBytes).toLowerCase();
	return token;
}

export function createSession(this: SvelteAuth, body: any) : {session: Session, token: string} {
	const token = generateSessionToken();
	const {userId, flags, ip} = body;

	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const session: Session = {
		id: sessionId,
		userId,
		expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
		twoFactorVerified: flags.twoFactorVerified
	};
	this.sql.exec("INSERT INTO session (id, user_id, expires_at, two_factor_verified, ip_country) VALUES (?, ?, ?, ?, ?)",
		session.id,
		session.userId,
		Math.floor(session.expiresAt.getTime() / 1000),
		Number(session.twoFactorVerified),
		ip
	);


	return {session: session, token: token}
}

export function validateSessionToken(this: SvelteAuth, body: any): SessionValidationResult {
	const {token} = body;
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	console.log(sessionId)
	const row = this.sql.exec(
		`
SELECT session.id as sesID, session.user_id, session.expires_at, session.two_factor_verified, user.id, user.email, user.username, user.email_verified, IIF(user.totp_key IS NOT NULL, 1, 0) as reg2fa FROM session
INNER JOIN user ON session.user_id = user.id
WHERE session.id = ?
`,
		sessionId
	).one();

	if (row === null) {
		return { session: null, user: null };
	}

	const session: Session = {
		id: row.sesID,
		userId: row.user_id,
		expiresAt: new Date(row.expires_at * 1000),
		twoFactorVerified: Boolean(row.two_factor_verified)
	};
	const user: User = {
		id: row.user_id,
		email: row.email,
		username: row.username,
		emailVerified: Boolean(row.email_verified),
		registered2FA: Boolean(row.reg2fa)
	};

	if (Date.now() >= session.expiresAt.getTime()) {
		this.sql.exec("DELETE FROM session WHERE id = ?", session.id);
		return { session: null, user: null };
	}
	if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
		session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
		this.sql.exec("UPDATE session SET expires_at = ? WHERE session.id = ?",
			Math.floor(session.expiresAt.getTime() / 1000),
			session.id
		);
	}
	return { session, user };
}

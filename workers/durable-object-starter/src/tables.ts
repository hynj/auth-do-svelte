import type { SvelteAuth } from ".";

export function setupTables(this: SvelteAuth) {
	//Set up the tables
	// Get table list
	const cursor = this.sql.exec(`PRAGMA table_list`);

	// Check if a table exists.
	if ([...cursor].find((t) => t.name === "user")) {
		console.log("Table already exists");
		return;
	}

	this.sql.exec(`
			CREATE TABLE user (
    			id TEXT NOT NULL PRIMARY KEY,
    			email TEXT NOT NULL UNIQUE,
    			username TEXT NOT NULL,
    			password_hash TEXT NOT NULL,
    			email_verified INTEGER NOT NULL DEFAULT 0,
    			totp_key BLOB,
    			recovery_code BLOB NOT NULL
			);

			CREATE INDEX email_index ON user(email);`);

	if ([...cursor].find((t) => t.name === "session")) {
		console.log("Table already exists");
		return;
	}

	this.sql.exec(`
				CREATE TABLE session (
    			id TEXT NOT NULL PRIMARY KEY,
    			user_id INTEGER NOT NULL REFERENCES user(id),
    			expires_at INTEGER NOT NULL,
					ip_country TEXT NOT NULL,
					two_factor_verified INTEGER NOT NULL DEFAULT 0
				);`);

	if ([...cursor].find((t) => t.name === "email_verification_request")) {
		console.log("Table already exists");
		return;
	}

	this.sql.exec(`CREATE TABLE email_verification_request (
    		id TEXT NOT NULL PRIMARY KEY,
    		user_id INTEGER NOT NULL REFERENCES user(id),
    		email TEXT NOT NULL,
    		code TEXT NOT NULL,
    		expires_at INTEGER NOT NULL
		);`);


	if ([...cursor].find((t) => t.name === "password_reset_session")) {
		console.log("Table already exists");
		return;
	}

	this.sql.exec(`CREATE TABLE password_reset_session (
   				id TEXT NOT NULL PRIMARY KEY,
    			user_id INTEGER NOT NULL REFERENCES user(id),
    			email TEXT NOT NULL,
    			code TEXT NOT NULL,
    			expires_at INTEGER NOT NULL,
    			email_verified INTEGER NOT NULL NOT NULL DEFAULT 0,
    			two_factor_verified INTEGER NOT NULL DEFAULT 0
			);`);
}


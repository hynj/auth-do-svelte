import { uuidv7 } from "uuidv7";
import type { SvelteAuth } from ".";
import { base32 } from "oslo/encoding"
import { getErrorMessage } from "./utility";

export interface User {
	id: string;
	email: string;
	username: string;
	emailVerified: boolean;
	registered2FA: boolean;
}


export async function createUser(this: SvelteAuth, body: any) {
	const { email, username, password } = body;
	const recoveryCode = generateRandomRecoveryCode();
	const newID = uuidv7();

	console.log(newID, email, username, password)

	let row;
	try {
		row = this.sql.exec(
			"INSERT INTO user (id, email, username, password_hash, recovery_code) VALUES (?, ?, ?, ?, ?);",
			newID, email, username, password, recoveryCode
		);
	}
	catch (error) {
		const errorMessage = getErrorMessage(error)
		return {
			User: null,
			Error: errorMessage
		}
	}

	console.log(row)

	console.log(`Number of rows written with insert: ${row.rowsWritten}`);


	return {
		User: {
			newID,
			email,
			username
		},
		Error: null
	}
}


export async function createUserParams(this: SvelteAuth, email: string, username:string, password: string) {
	const recoveryCode = generateRandomRecoveryCode();
	const newID = uuidv7();

	console.log(newID, email, username, password)

	let row;
	try {
		row = this.sql.exec(
			"INSERT INTO user (id, email, username, password_hash, recovery_code) VALUES (?, ?, ?, ?, ?);",
			newID, email, username, password, recoveryCode
		);
	}
	catch (error) {
		const errorMessage = getErrorMessage(error)
		return {
			User: null,
			Error: errorMessage
		}
	}

	console.log(row)

	console.log(`Number of rows written with insert: ${row.rowsWritten}`);


	return {
		User: {
			newID,
			email,
			username
		},
		Error: null
	}
}



export async function createUserAndSession(this: SvelteAuth, body: any) {
	const newUser = await this.createUser(body)
	if (newUser.Error || newUser.User == null) {
		console.log(newUser.Error)
		return { Error: newUser.Error }
	}

	//const {userId, flags, ip} = body;
	const sessionParams = {
		userId: newUser.User.newID,
		flags: body.flags,
		ip: body.ip
	}

	try {
		const session = await this.createSession(sessionParams)
		return {
			User: newUser.User,
			Session: session.session,
			Token: session.token,
			Error: null
		}
	}
	catch (error) {
		const errorMessage = getErrorMessage(error)
		console.log(errorMessage)
		return {
			User: newUser.User,
			Error: errorMessage
		}
	}
}

export async function updateUserPassword(this: SvelteAuth, body: any): Promise<{ success: boolean, error?: string }> {
	const { userId, password } = body;
	try {
		const row = this.sql.exec("UPDATE user SET password_hash = ? WHERE id = ?", password, userId);
		console.log(`Returned output of exec: ${row}`);
		console.log(`Number of rows written with update password: ${row.rowsWritten}`);
	}
	catch (error) {
		const errorMessage = getErrorMessage(error)
		console.log(errorMessage)
		return { success: false, error: errorMessage }
	}
	return { success: true }
}

export async function checkPassword(this: SvelteAuth, body: any) {
	const { email, hashedPassword } = body;

	try {
		const row = this.sql.exec("SELECT * from user WHERE email = ?", email).one()
		if (row.password_hash === hashedPassword) {
			return { checked: true, userID: row.id };
		}
		else {
			return { checked: false, userID: null };
		}
	}
	catch (error) {
		const errorMessage = getErrorMessage(error)
		console.log(errorMessage)
		return { checked: false, userID: null, error: errorMessage };
	}
}

export async function checkPasswordAndSession(this: SvelteAuth, body: any) {
	const { email, hashedPassword, ip, flags } = body;

	const checkPassword = await this.checkPassword({ email, hashedPassword })

	if (checkPassword.checked) {
	const userId = checkPassword.userID;
		const session = await this.createSession({userId, ip, flags});
		return {error: null, ...session}
	}
	else if (checkPassword.error){
		return {error: checkPassword.error}
	}
	else{
		return {error: "Password Wrong"}
	}
}



function generateRandomRecoveryCode(): string {
	const recoveryCodeBytes = new Uint8Array(10);
	crypto.getRandomValues(recoveryCodeBytes);
	const recoveryCode = base32.encode(recoveryCodeBytes, { includePadding: false });
	return recoveryCode;
}


export type CreateUserAndSession = ReturnType<typeof createUserAndSession>

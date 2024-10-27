import { DurableObject } from "cloudflare:workers";
import { setupTables } from "./tables";
import {
	createUser as createUserImport,
	createUserAndSession as createUserAndSessionImport,
	checkPassword as checkPasswordImport,
	checkPasswordAndSession as checkPasswordAndSessionImport,
	createUserParams
} from "./user";
import { createSession as createSessionImport, validateSessionToken as validateSessionTokenImport } from "./session";
/**
 * Welcome to Cloudflare Workers! This is your first Durable Objects application.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your Durable Object in action
 * - Run `npm run deploy` to publish your application
 *
 * Bind resources to your worker in `wrangler.toml`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/durable-objects
 */

/** A Durable Object's behavior is defined in an exported Javascript class */
export class SvelteAuth extends DurableObject {
	sql = this.ctx.storage.sql;
	/**
	 * The constructor is invoked once upon creation of the Durable Object, i.e. the first call to
	 * 	`DurableObjectStub::get` for a given identifier (no-op constructors can be omitted)
	 *
	 * @param ctx - The interface for interacting with Durable Object state
	 * @param env - The interface to reference bindings declared in wrangler.toml
	 */
	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
		this.setupTable();
	}

	private setupTable = setupTables;	//Set up the tables
	//createUser = createUserImport;
	//public createSession = createSession;
	//public validateSessionToken = validateSessionToken;


	/**
	 * The Durable Object exposes an RPC method sayHello which will be invoked when when a Durable
	 *  Object instance receives a request from a Worker via the same method invocation on the stub
	 *
	 * @param name - The name provided to a Durable Object instance from a Worker
	 * @returns The greeting to be sent back to the Worker
	 */

	//Stupid hacky thing...
	async createUser(body: any) {
		const boundCreate = createUserImport.bind(this)
		return boundCreate(body)
	}

	async createSession(body: any) {
		const boundCreate = createSessionImport.bind(this)
		return boundCreate(body)
	}

	async createUserAndSession(body: any) {
		const boundCreate = createUserAndSessionImport.bind(this)
		return boundCreate(body)
	}

	async validateSessionToken(body: any) {
		return validateSessionTokenImport.bind(this)(body)
	}

	async checkPassword(body: any) {
		return checkPasswordImport.bind(this)(body)
	}
	async checkPasswordAndSession(body: any) {
		return checkPasswordAndSessionImport.bind(this)(body)
	}



	async sayHello(body: any): Promise<string> {
		return `Hello, ${body.name}!`
	}


	async sayTom(body: any): Promise<string> {
		return `Hey Tom!`
	}


	async returnObjectTest(body: any): Promise<{ testObj: { subObj: string } }> {
		return { testObj: { subObj: "test" } }
	}



	async fetch(request) {
		console.log("received request")
		const url = new URL(request.url);
		const body = await request.json();
		console.log(body)
		const params = body.params;
		console.log(params)
		const functionName = url.pathname.substring(1)

		if (this[functionName as keyof this] === undefined) return new Response("Bad Request", { status: 400 });

		const functionResponse = await this[functionName](params)

		return new Response(JSON.stringify(functionResponse))
	}
}

export default {
	/**
	 * This is the standard fetch handler for a Cloudflare Worker
	 *
	 * @param request - The request submitted to the Worker from the client
	 * @param env - The interface to reference bindings declared in wrangler.toml
	 * @param ctx - The execution context of the Worker
	 * @returns The response to be sent back to the client
	 */
	async fetch(request, env, ctx): Promise<Response> {
		// We will create a `DurableObjectId` using the pathname from the Worker request
		// This id refers to a unique instance of our 'MyDurableObject' class above
		let id: DurableObjectId = env.MY_DURABLE_OBJECT.idFromName(new URL(request.url).pathname);

		// This stub creates a communication channel with the Durable Object instance
		// The Durable Object constructor will be invoked upon the first call for a given id
		let stub = env.MY_DURABLE_OBJECT.get(id);

		// We call the `sayHello()` RPC method on the stub to invoke the method on the remote
		// Durable Object instance
		let greeting = await stub.sayHello("world");

		return new Response(greeting);
	},
} satisfies ExportedHandler<Env>;


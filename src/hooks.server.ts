import { stubProxy } from "$lib/server/rpcFetch";
import type { Handle } from "@sveltejs/kit"
import type { SvelteAuth } from "../workers/durable-object-starter/src";
import { building } from "$app/environment";
import { deleteSessionTokenCookie, setSessionTokenCookie } from "$lib/auth";

export const handle: Handle = async ({ event, resolve }) => {
  //Setup DO
  const id = event.platform.env.svelte_auth.idFromName("user");

  const stub = event.platform.env.svelte_auth.get(id) as SvelteAuth;

  const proxiedStub = new stubProxy(stub)

  event.platform.env.AuthDOProxy = proxiedStub;

  if (!building) {

    const token = event.cookies.get("session") ?? null;
    if (token === null) {
      event.locals.user = null;
      event.locals.session = null;
      return resolve(event);
    }
    const { session, user } = await proxiedStub.call('validateSessionToken', { token: token });
    console.log(session)

    if (session !== null) {
      setSessionTokenCookie(event, token, session.expiresAt);
    } else {
      deleteSessionTokenCookie(event);
    }
    event.locals.session = session;
    event.locals.user = user;

  }

  return resolve(event);
}


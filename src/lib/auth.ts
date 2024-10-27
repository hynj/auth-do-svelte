import type { RequestEvent } from "@sveltejs/kit";

export function setSessionTokenCookie(event: RequestEvent, token: string, expiresAt: Date | string): void {

  let expires = expiresAt;

  //RPC calls are able to return date objects... Doesen't work in local development...
  if (!(expires instanceof Date)) {
    console.log("not a date making a date")
    expires = new Date(expires)
  }
  event.cookies.set("session", token, {
    httpOnly: true,
    path: "/",
    secure: import.meta.env.PROD,
    sameSite: "lax",
    expires: expires
  });
}

export function deleteSessionTokenCookie(event: RequestEvent): void {
  event.cookies.set("session", "", {
    httpOnly: true,
    path: "/",
    secure: import.meta.env.PROD,
    sameSite: "lax",
    maxAge: 0
  });
}

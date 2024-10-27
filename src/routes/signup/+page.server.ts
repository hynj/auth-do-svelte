import type { Actions } from './$types';
import { argonHash } from '$lib/server/password-hash';
import { setSessionTokenCookie } from '$lib/auth';
import type { CreateUserAndSession } from '../../../workers/durable-object-starter/src/user'

export const actions = {
  default: async (event) => {
    // TODO log the user in
    //
    const proxiedStub = event.platform?.env.AuthDOProxy;
    const formInput = await event.request.formData();
    const { username, password, email } = Object.fromEntries(formInput)
    const passwordHashed = await argonHash(event.platform, password as string);
    console.log(passwordHashed)

    //const responseFromUser = await proxiedStub.call('createUser', { username, password: passwordHashed, email })

    //const responseMakeSession = await proxiedStub.call('createSession', { userId: responseFromUser.User.newID, flags: { twoFactorVerified: false }, ip: "192.168.1.61" })

    const authDoResponse = await proxiedStub.call('createUserAndSession', {
      username,
      password: passwordHashed,
      email,
      flags: { twoFactorVerified: false },
      ip: "192.168.1.61"
    }) as Awaited<CreateUserAndSession>

    if (authDoResponse.Error != null) {
      if (authDoResponse.Error.startsWith("UNIQUE")) {
        //TODO: return to client
        console.log("Email already in use")
      }
      console.log(authDoResponse.Error)
      return;
    }

    setSessionTokenCookie(event, authDoResponse.Token, authDoResponse.Session?.expiresAt)

  }
} satisfies Actions;

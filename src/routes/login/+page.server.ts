import type { Actions } from './$types';
import { argonHash, argonVerify } from '$lib/server/password-hash';
import { setSessionTokenCookie } from '$lib/auth';

export const actions = {
  default: async (event) => {
    // TODO log the user in
    //
    const proxiedStub = event.platform?.env.AuthDOProxy;
    const formInput = await event.request.formData();
    const { username, password, email } = Object.fromEntries(formInput)

    const passwordHashed = await argonHash(event.platform, password as string)


    const checkPassword = await proxiedStub.call('checkPasswordAndSession', {
      email,
      hashedPassword: passwordHashed,
      ip: "192.168.1.61",
      flags: { twoFactorVerified: false }
    })
    if (checkPassword.error != null){
      console.log(checkPassword.error)
      return;
    }
    console.log(checkPassword)
    setSessionTokenCookie(event, checkPassword.token, checkPassword.session?.expiresAt)

    //const passwordHashed = await argonVerify(event.platform, hash, password as string);
    //console.log(passwordHashed)

  }
} satisfies Actions;

import type { SvelteAuth } from '../../../workers/durable-object-starter/src';
import type { PageServerLoad } from './$types';
import { proxyHandler, stubProxy } from '$lib/server/rpcFetch';
import { argonHash, argonVerify } from '$lib/server/password-hash';
import { stubProxyTakeTwo } from '$lib/server/rpcFetch';

export const load: PageServerLoad = async ({ platform }) => {
/*  const env = platform.env;

  const id = env.svelte_auth.idFromName("test");

  const stub = env.svelte_auth.get(id) as SvelteAuth;

  const proxiedStub = new stubProxy(stub)

  */
  //const proxyStubTwo = stubProxyTakeTwo(platform.env.svelte_auth);

  //const is = proxyStubTwo.sayHello()
  
  const is = "awdwad";
  const env = platform.env;

    const id = env.svelte_auth.idFromName("test");

  const stub = env.svelte_auth.get(id) as SvelteAuth;


  const stubProxyThree = new Proxy(stub, proxyHandler as any as ProxyHandler<SvelteAuth>)

 await stubProxyThree.sayTom("wdwd")
  

  /*const proxiedStub = platform.env.AuthDOProxy;

  const responseFromHello = await platform?.env.AuthDOProxy.call('sayHello', { name: "Roger Moor" })
  const responseFromObj = await platform?.env.AuthDOProxy.call('returnObjectTest', { name: "rog" })
  console.log(responseFromHello)
  console.log(responseFromObj)

  const responseFromUser = await proxiedStub.call('createUser', {username: "thenick12", password: "helawdawd", email: "thenick1922@gmail.com"})
  console.log(responseFromUser)

  const responseMakeSession = await proxiedStub.call('createSession', {userId: responseFromUser.User.newID, flags: {twoFactorVerified: false}, ip: "192.168.1.61" })
  console.log(responseMakeSession)
  const responseFromSession = await proxiedStub.call('validateSessionToken', {token: responseMakeSession.token})
  console.log(responseFromSession)
  //
  const hashedP = await argonHash(platform, "hello")
  const isVerify = await argonVerify(platform, hashedP, "blab")
  console.log(isVerify)

  const actualVerify = await argonVerify(platform, hashedP, "hello")
  console.log(`Should be coorect: ${actualVerify}`)

  */

  //const {token, userId, flags} = body;
  return { message: is, passOK: true }
}

import { dev } from "$app/environment"
import type { SvelteAuth as SVAuth } from "../../../workers/durable-object-starter/src";
import { createUser } from "../../../workers/durable-object-starter/src/user";


//So theres an actual thing called a proxy...
export class stubProxy<SVAuth> {
  private _stub: SVAuth;

  constructor(stub: SVAuth) {
    this._stub = stub;
  }

  public async call(target: keyof SVAuth, params: any) {
    if (!dev) return await this._stub[target](params)

    const requestURL = `http://do/${String(target)}`
    const bodyObject = JSON.stringify({
      params: params
    })
    let response = await this._stub.fetch(requestURL, { method: "POST", body: bodyObject });


    if (response.ok) {
      return await response.json();
    }
    else {
      throw "Internal server error, fetch on DO failed"
    }
  }
}


const DOAuthProxy = new Proxy(stubProxy, {
  get(target, prop) {
    if (!dev) return target[prop];

  },
  construct(target, argumentsList, newTarget) {
    return newTarget
  }
});

class SvelteAuthProxy {
  private _stub: SVAuth;
  constructor(stub: SVAuth) {
    this._stub = stub;
  }


  public async sayHello() {

    console.log("hello")
  };

  public async createUser() {

  };
  public async call(target: keyof SVAuth, params: any) {
    console.log("Call being called")
    if (!dev) return await this._stub[target](params)

    const requestURL = `http://do/${String(target)}`
    const bodyObject = JSON.stringify({
      params: params
    })
    let response = await this._stub.fetch(requestURL, { method: "POST", body: bodyObject });


    if (response.ok) {
      return await response.json();
    }
    else {
      throw "Internal server error, fetch on DO failed"
    }
  }
}

export const stubProxyTakeTwo = (stub: SVAuth) => {
  return new Proxy(new SvelteAuthProxy(stub), {
    get(target: typeof SVAuth, prop: keyof typeof SVAuth) {
      return target.call[prop]
    }
  })
}


export const proxyHandler = {
  get(target: keyof SVAuth, prop: keyof typeof SVAuth, receiver) {
    if (!dev) return Reflect.get(this, ...arguments)
      return async function(...args) {
        console.log("running arm")

        const requestURL = `http://do/${String(prop)}`

        const bodyObject = JSON.stringify({
          params: args
        })
        let response =await  target['fetch'](requestURL, { method: "POST", body: bodyObject });


        if (response.ok) {
          return await response.json();
        }
        else {
          throw "Internal server error, fetch on DO failed"
        }
      }
    }
}


/* async createUser(body: any) {
  if (!dev) {
    return this._stub.createUser(body)
  }
  else {
    const returnFrom = this.call('createUser', body) as ReturnType<SVClass['createUser']>
    return returnFrom 
  }
}

  async createSession(body: any) {
  if (!dev) return this._stub.createSession(body);
}

async createUserAndSession(body: any) {
}

async validateSessionToken(body: any) {
}

async checkPassword(body: any) {
}
async checkPasswordAndSession(body: any) {
}


*/


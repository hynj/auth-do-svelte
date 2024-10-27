// See https://kit.svelte.dev/docs/types#app

import type { Session } from "../workers/durable-object-starter/src/session";
import type { User } from "../workers/durable-object-starter/src/user";

// for information about these interfaces
declare global {
  namespace App {
    interface Platform {
      env: {
        svelte_auth: DurableObjectNamespace<import("../workers/durable-object-starter/src/index").SvelteAuth>;
        PasswordHasher: Fetcher; 
        AuthDOProxy: DurableObjectNamespace<import("../workers/durable-object-starter/src/index").SvelteAuth>;
      }
      cf: CfProperties
      ctx: ExecutionContext
    }
    interface Locals {
			user: User | null;
			session: Session | null;
		}
  }
}

export { };

import { AuthClient } from "@dfinity/auth-client";
import { CryptoService } from "../lib/crypto";
import type { JsonnableDelegationChain } from "@dfinity/identity/lib/cjs/identity/delegation";
import { WritableAuthContextType } from "../hooks/AuthContext";
import { createActor } from "../../../declarations/ii_integration_backend";
import { _SERVICE } from "../../../declarations/ii_integration_backend/ii_integration_backend.did";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function initAuth(auth: WritableAuthContextType) {
  const client = await AuthClient.create({
    idleOptions: { disableIdle: true },
  });
  console.log("Client Made");
  if (await client.isAuthenticated()) {
    authenticate(auth, client);
  } else {
    auth.updateValue({
      state: "anonymous",
      actor: createActor(process.env.CANISTER_ID_II_INTEGRATION_BACKEND!),
      client,
    });
  }
}

export function login(auth: WritableAuthContextType) {
  const currentAuth = auth.value;

  if (currentAuth.state === "anonymous") {
    currentAuth.client.login({
      identityProvider:
        process.env.DFX_NETWORK === "ic"
          ? "https://identity.ic0.app/#authorize"
          : `http://be2us-64aaa-aaaaa-qaabq-cai.localhost:4943/`,
      onSuccess: () => authenticate(auth, currentAuth.client),
    });
  }
}

export async function logout(auth: WritableAuthContextType) {
  const currentAuth = auth.value;

  if (currentAuth.state === "initialized") {
    currentAuth.crypto.logout();
    await currentAuth.client.logout();
    auth.updateValue({
      state: "anonymous",
      actor: createActor(process.env.CANISTER_ID_II_INTEGRATION_BACKEND!),
      client: currentAuth.client,
    });
  }
}

export async function authenticate(
  auth: WritableAuthContextType,
  client: AuthClient
) {
  console.log("AUTHETNTICATE");
  handleSessionTimeout(auth);

  try {
    const actor = createActor(process.env.CANISTER_ID_II_INTEGRATION_BACKEND!, {
      agentOptions: {
        identity: client.getIdentity(),
      },
    });

    auth.updateValue({
      state: "initializing-crypto",
      actor,
      client,
    });

    const cryptoService = new CryptoService(actor);
    const initialized = await cryptoService
      .init()
      .catch((e) => console.log(e, "Could not initialize crypto service"));

    if (initialized) {
      auth.updateValue({
        state: "initialized",
        actor,
        client,
        crypto: cryptoService,
      });
    } else {
      // syncing required
      auth.updateValue({
        state: "synchronizing",
        actor,
        client,
      });

      while (true) {
        await sleep(1000);
        console.log("Polling for seed");
        try {
          const initialized = await cryptoService.pollForSeed();
          console.log("Polling for seed result", initialized);
          if (initialized) {
            auth.updateValue({
              state: "initialized",
              actor,
              client,
              crypto: cryptoService,
            });
            break;
          }
        } catch (e) {
          console.error(e);
          console.log("Could not check synchronization status");
        }
      }
    }
  } catch (e: any) {
    auth.updateValue({
      state: "error",
      error: e.message || "An error occurred",
    });
  }
}

// set a timer when the II session will expire and log the user out
function handleSessionTimeout(auth: WritableAuthContextType) {
  // upon login the localstorage items may not be set, wait for next tick
  setTimeout(() => {
    try {
      const delegation = JSON.parse(
        window.localStorage.getItem("ic-delegation")!
      ) as JsonnableDelegationChain;

      const expirationTimeMs =
        Number.parseInt(delegation.delegations[0].delegation.expiration, 16) /
        1000000;

      setTimeout(() => {
        logout(auth);
      }, expirationTimeMs - Date.now());
    } catch {
      console.error("Could not handle delegation expiry.");
    }
  });
}

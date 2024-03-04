import {
  createActor,
  ii_integration_backend,
} from "../../declarations/ii_integration_backend";
import { AuthClient } from "@dfinity/auth-client";
import { HttpAgent } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { useState } from "react";

let actor = ii_integration_backend;

BigInt.prototype.toJSON = function () {
  return this.toString();
};

function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  const [result, setResult] = useState(null);

  return (
    <main>
      <p>{loggedIn ? "You are logged in." : "Please log in."}</p>
      <p>{result}</p>
      <button
        onClick={async (e) => {
          e.preventDefault();

          const res = await actor.list_accounts();

          setResult(JSON.stringify(res));
          return false;
        }}
      >
        List Accounts
      </button>

      <button
        onClick={async (e) => {
          e.preventDefault();

          const res = await actor.create_account();

          setResult(JSON.stringify(res));
          return false;
        }}
      >
        Create Account
      </button>

      <button
        onClick={async (e) => {
          e.preventDefault();

          const res = await actor.account_balance();

          setResult(JSON.stringify(res));
          return false;
        }}
      >
        Balance
      </button>

      <button
        onClick={async (e) => {
          e.preventDefault();

          const res = await actor.free_money();

          setResult(JSON.stringify(res));
          return false;
        }}
      >
        Free Money
      </button>

      <button
        onClick={async (e) => {
          e.preventDefault();

          const res = await actor.transfer({
            amount: { amount_e8s: 50000 },
            to: Principal.fromText(
              "q5s77-ckvss-ukhyu-mkyg6-fftb3-cmpjt-f47bo-unugw-lg4yn-ruy6n-xae"
            ),
          });

          setResult(JSON.stringify(res));
          return false;
        }}
      >
        Send 50,000 to Alice
      </button>

      <button
        onClick={async (e) => {
          e.preventDefault();
          let authClient = await AuthClient.create();
          await new Promise((resolve) => {
            authClient.login({
              identityProvider: `http://be2us-64aaa-aaaaa-qaabq-cai.localhost:4943`,
              onSuccess: resolve,
            });
          });
          setLoggedIn(true);
          const identity = authClient.getIdentity();
          const agent = new HttpAgent({ identity });
          actor = createActor(process.env.CANISTER_ID_II_INTEGRATION_BACKEND, {
            agent,
          });
          return false;
        }}
      >
        Log In
      </button>
    </main>
  );
}

export default App;

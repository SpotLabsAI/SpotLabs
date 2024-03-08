import { useEffect } from "react";
import { WritableAuthContextType, useAuth } from "./hooks/AuthContext";
import { initAuth } from "./lib/auth";
import Login from "./pages/Login";
import { getFacts } from "./lib/utils";
import { WritableFactContextType, useFact } from "./hooks/FactContext";
import { addFact, deleteFact } from "./lib/fact";

function App() {
  const auth: WritableAuthContextType = useAuth();
  const fact: WritableFactContextType = useFact();

  useEffect(() => {
    initAuth(auth);
  }, []);

  return (
    <main>
      {auth.value.state === "initialized" ? (
        <>
          <p>Logged in</p>
          <button
            onClick={async (e) => {
              e.preventDefault();
              const res = await addFact({
                type: "cal",
                content: "i am the glob go gab galab the shwabble dabble wabble gabble flibba blabba blab",
              }, fact, auth);
              console.log(res);
            }}
          >
            Add a fact
          </button>

          <button
            onClick={async (e) => {
              e.preventDefault();
              const res = getFacts(fact);
              console.log(res);
            }}
          >
            Get all facts
          </button>

          <button
            onClick={async (e) => {
              e.preventDefault();
              const res = await deleteFact(7n, auth, fact);
              console.log(res);
            }}
          >
            DELETE FACT ID: 4
          </button>
        </>
      ) : (
        <Login />
      )}
    </main>
  );
}

export default App;

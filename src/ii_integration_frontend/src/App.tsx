import { useEffect, useState } from "react";
import { WritableAuthContextType, useAuth } from "./hooks/AuthContext";
import { initAuth } from "./lib/auth";
import Login from "./pages/Login";
import { getFacts } from "./lib/utils";
import { WritableFactContextType, useFact } from "./hooks/FactContext";
import { addFact, deleteFact } from "./lib/fact";
import * as webllm from "@mlc-ai/web-llm";

function App() {
  const auth: WritableAuthContextType = useAuth();
  const fact: WritableFactContextType = useFact();

  const [label, setLabel] = useState<string>("");
  const [chat, setChat] = useState<webllm.ChatModule | null>(null);

  useEffect(() => {
    initAuth(auth);

    const chat = new webllm.ChatModule();
    chat.setInitProgressCallback((report: webllm.InitProgressReport) => {
      setLabel(`init-label ${report.text}`);
    });

    (async () => {
      await chat.reload("Llama-2-7b-chat-hf-q4f32_1");

      const generateProgressCallback = (_step: number, message: string) => {
        setLabel(`generate-label ${message}`);
      };

      const prompt0 = "What is the capital of Canada?";
      setLabel(`prompt-label ${prompt0}`);
      const reply0 = await chat.generate(prompt0, generateProgressCallback);
      console.log(reply0);
    })();
    setChat(chat);
  }, []);

  return (
    <main>
      {auth.value.state === "initialized" ? (
        <>
          <p>Logged in</p>
          <p>{label}</p>
        </>
      ) : (
        <Login />
      )}
    </main>
  );
}

export default App;

import { useEffect, useState } from "react";
import { WritableAuthContextType, useAuth } from "./hooks/AuthContext";
import { initAuth } from "./lib/auth";
import Login from "./pages/Login";
import { WritableFactContextType, useFact } from "./hooks/FactContext";
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
      console.log("ChatModule init");
      await chat.reload("GORILLA", {
        conv_template: "custom",
        conv_config: {
          system: "SYSTEM: Do not reply to the user. Only reply with the required function call.\n",
          roles: ["SYSTEM", "USER", "ASSISTANT"],
          seps: ["<<question>>", "<<function>>"],
          separator_style: "Two",
          offset: 0,
          add_bos: true,
          stop_tokens: [2],
          stop_str: "<|EOT|>",
        }
      }, {
        model_list: [
          {
            "model_url": "https://huggingface.co/mlc-ai/RedPajama-INCITE-Chat-3B-v1-q4f16_1-MLC/resolve/main/",
            "local_id": "RED_PJ",
            "model_lib_url": "https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/RedPajama-INCITE-Chat-3B-v1/RedPajama-INCITE-Chat-3B-v1-q4f16_1-ctx2k-webgpu.wasm",
            "vram_required_MB": 2972.09,
            "low_resource_required": false,
            "required_features": ["shader-f16"],
          },
          {
            "model_url": "https://huggingface.co/mlc-ai/gorilla-openfunctions-v2-q4f16_1-MLC/resolve/main/",
            "local_id": "GORILLA",
            "model_lib_url": "https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/gorilla-openfunctions-v2/gorilla-openfunctions-v2-q4f16_1.wasm",
          }
        ],
      });

      const generateProgressCallback = (_step: number, message: string) => {
        setLabel(`generate-label ${message}`);
      };

      const prompt0 = "USER: <<question>> Call me an Uber ride type \"Plus\" in Berkeley at zipcode 94704 in 10 minutes <<function>> [{\"name\": \"Uber Carpool\", \"api_name\": \"uber.ride\", \"description\": \"Find suitable ride for customers given the location, type of ride, and the amount of time the customer is willing to wait as parameters\", \"parameters\": [{\"name\": \"loc\", \"description\": \"Location of the starting place of the Uber ride\"}, {\"name\": \"type\", \"enum\": [\"plus\", \"comfort\", \"black\"], \"description\": \"Types of Uber ride user is ordering\"}, {\"name\": \"time\", \"description\": \"The amount of time in minutes the customer is willing to wait\"}]}]\nASSISTANT:";
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

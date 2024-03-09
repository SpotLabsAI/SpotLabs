import { useEffect, useState } from "react";
import { WritableAuthContextType, useAuth } from "./hooks/AuthContext";
import { initAuth } from "./lib/auth";
import { WritableFactContextType, useFact } from "./hooks/FactContext";
import * as webllm from "@mlc-ai/web-llm";
import Loading, { LoadingReport } from "./pages/Loading";
import Home from "./pages/Home";
//Importing commands from JSON
import commandsJson from './lib/commands.json';

function App() {
  const auth: WritableAuthContextType = useAuth();
  const fact: WritableFactContextType = useFact();

  const [chat, setChat] = useState<webllm.ChatModule | null>(null);
  const [downloadReport, setDownloadReport] = useState<LoadingReport>({
    report: null,
    done: false,
  });

  useEffect(() => {
    initAuth(auth);

    const chat = new webllm.ChatModule();
    chat.setInitProgressCallback((report: webllm.InitProgressReport) => {
      setDownloadReport({ report, done: false });
    });

    (async () => {
      console.log("ChatModule init");
      
      await chat.reload(
        "GORILLA",
        {
          conv_template: "custom",
          conv_config: {
            system: `The assistant does not reply to the user. The assistant replies with a function call on the format api_name(params). The functions are ` + JSON.stringify(commandsJson) + "\n", 
            roles: ["USER", "ASSISTANT"],
            seps: ["<<question>>", "<<function>>"],
            separator_style: "Two",
            offset: 0,
            add_bos: true,
            stop_tokens: [2],
            stop_str: "<|EOT|>",
          },
        },
        {
          model_list: [
            {
              model_url:
                "https://huggingface.co/mlc-ai/gorilla-openfunctions-v2-q4f16_1-MLC/resolve/main/",
              local_id: "GORILLA",
              model_lib_url:
                "https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/gorilla-openfunctions-v2/gorilla-openfunctions-v2-q4f16_1.wasm",
            },
          ],
        }
      );

      setDownloadReport({ report: null, done: true });
    })();
    setChat(chat);
  }, []);

  return (
    <main>
      {auth.value.state === "initialized" && downloadReport.done ? (
        <Home chat={chat}/>
      ) : (
        <Loading report={downloadReport} />
      )}
    </main>
  );
}

export default App;

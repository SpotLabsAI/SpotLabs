import { useEffect, useState } from "react";
import { WritableAuthContextType, useAuth } from "./hooks/AuthContext";
import { initAuth } from "./lib/auth";
import { WritableFactContextType, useFact } from "./hooks/FactContext";
import * as webllm from "@mlc-ai/web-llm";
import Loading, { LoadingReport } from "./pages/Loading";
import Home from "./pages/Home";

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
            system: `The assistant does not reply to the user. The assistant replies with a function call on the format api_name(params). The functions are [{"api_name": "cd", "description": "Delete a calendar event by its ID", "parameters": [{"name": "eventId", "description": "The ID of the event to be deleted"}]},{"api_name": "cc", "description": "Create an event with details from parameters provided by user", "parameters": [{"name": "title", "description": "The title of the event"}, {"name": "date", "description": "The date of the event in dd-mm-yyyy format"}, {"name": "summary", "description": "A brief summary of the event from user's prompt"}]},{"api_name": "cu", "description": "Replace an existing event with parameters provided by user", "parameters": [{"name": "eventId", "description": "The ID of the event to replace."}, {"name": "title", "description": "The new title of the event"}, {"name": "date", "description": "The new date of the event in dd-mm-yyyy format"}, {"name": "summary", "description": "A new brief summary of the event from new user's prompt"}]}]\n`, 
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

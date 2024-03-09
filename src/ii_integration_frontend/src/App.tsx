import { useEffect, useState } from "react";
import { WritableAuthContextType, useAuth } from "./hooks/AuthContext";
import { initAuth } from "./lib/auth";
import { WritableFactContextType, useFact } from "./hooks/FactContext";
import * as webllm from "@mlc-ai/web-llm";
import Loading, { LoadingReport } from "./pages/Loading";
import Home from "./pages/Home";

function App() {
  const auth: WritableAuthContextType = useAuth();

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
        "LLAMA",
        {
          conv_template: "llama-2",
          conv_config: {
            "system": "[INST] <<SYS>> You're a company assistant. You are helpful, respectful, and friendly" +
            "Always answer as helpfully as possible, while being safe. " +
            "Your answers should not include any harmful, unethical, racist, sexist, toxic, dangerous, or illegal content. " +
            "Please ensure that your responses are socially unbiased and positive in nature.\n\n" +
            "If you don't know the answer to a question, please don't share false information.\n<</SYS>>\n\n ",
          }
        },
        {
          model_list: [
            {
              model_url:
                "https://huggingface.co/mlc-ai/Llama-2-13b-chat-hf-q4f16_1-MLC/resolve/main/",
              local_id: "LLAMA",
              model_lib_url:
                "https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/Llama-2-13b-chat-hf/Llama-2-13b-chat-hf-q4f16_1-ctx4k_cs1k-webgpu.wasm",
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
        <Home chat={chat} />
      ) : (
        <Loading report={downloadReport} />
      )}
    </main>
  );
}

export default App;

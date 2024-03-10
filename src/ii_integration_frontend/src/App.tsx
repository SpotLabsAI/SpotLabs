import { useEffect, useState } from "react";
import { WritableAuthContextType, useAuth } from "./hooks/AuthContext";
import { initAuth } from "./lib/auth";
import * as webllm from "@mlc-ai/web-llm";
import Loading, { LoadingReport } from "./pages/Loading";
import Home from "./pages/Home";
import PluginManager from "./pages/PluginManager";
import Visualizer from "./pages/Visualizer";
import { getCrypto } from "./lib/utils";

const App = () => {
  const auth: WritableAuthContextType = useAuth();

  const [chat, setChat] = useState<webllm.ChatModule | null>(null);
  const [pluginWindowOpen, setPluginWindowOpen] = useState<boolean>(false);
  const [dataWindowOpen, _setDataWindowOpen] = useState<boolean>(false);
  const [downloadReport, setDownloadReport] = useState<LoadingReport>({
    report: null,
    done: false,
  });

  const setDataWindowOpen = (b: boolean) => {
    getCrypto(auth).paused = b;
    _setDataWindowOpen(b);
  }

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
            "system": "[INST] <<SYS>> You're a company assistant. You reply in a concise manner. You do as what you are told. " +
            // "If user inputs date, always convert it to dd-mm-yyyy format. " +
            "You strictly reply with the following JSON: { \"function\": {function_name}, \"args\": [] } based on the available functions: function_name=create_supply_chain args=[{title}, {deliverDate}, {receiveDate}, {origin}, {description}], function_name=delete_supply_chain args=[{id}], function_name=update_supply_chain args=[{id}, {title}, {deliverDate}, {receiveDate}, {origin}, {description}]. The INST block then will be a json string: { \"prompt\": {the user input}}.\n<</SYS>>\n\n "
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
        pluginWindowOpen ? (
          <PluginManager close={() => setPluginWindowOpen(false)} />
        ) : dataWindowOpen ? (
          <Visualizer close={() => setDataWindowOpen(false)}/>
        ) : (
          <Home
            chat={chat}
            pluginManagerOpen={() => setPluginWindowOpen(true)}
            dataWindowOpen={() => setDataWindowOpen(true)}
          />
        )
      ) : (
        <Loading report={downloadReport} />
      )}
    </main>
  );
}

export default App;

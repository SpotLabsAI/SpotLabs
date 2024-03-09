import { useEffect, useState } from "react";
import { WritableAuthContextType, useAuth } from "./hooks/AuthContext";
import { initAuth } from "./lib/auth";
import * as webllm from "@mlc-ai/web-llm";
import Loading, { LoadingReport } from "./pages/Loading";
import Home from "./pages/Home";
import commandsJson from "./lib/commands.json";
import PluginManager from "./pages/PluginManager";

function App() {
  const auth: WritableAuthContextType = useAuth();

  const [chat, setChat] = useState<webllm.ChatModule | null>(null);
  const [pluginWindowOpen, setPluginWindowOpen] = useState<boolean>(false);
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
            "system": "[INST] <<SYS>> You're a company assistant. You do as what you are told" +
            "Any date inputted by user will always follow the format dd-mm-yyyy. If not, convert the date to the right format. " +
            "If the user's prompt is a command, you only communicate using JSON files. The expected output from you has to be: { \"function\": {function_name}, \"args\": [] }. The INST block then will be a json string: { \"prompt\": {the user input}}. Here are the functions available to you: [function_name=create_supply_chain args=[{title}, {deliverDate}, {receiveDate}, {origin}, {description}]], [function_name=delete_supply_chain args=[{title}]], [function_name=update_supply_chain args=[{title}, {deliverDate}, {receiveDate}, {origin}, {description}]]\n<</SYS>>\n\n ",
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

  // Check if path is plugin_manager

  return (
    <main>
      {auth.value.state === "initialized" && downloadReport.done ? (
        pluginWindowOpen ? (
          <PluginManager close={() => setPluginWindowOpen(false)}/>
        ) : (
          <Home chat={chat} pluginManagerOpen={() => setPluginWindowOpen(true)}/>
        )
      ) : (
        <Loading report={downloadReport} />
      )}
    </main>
  );
}

export default App;

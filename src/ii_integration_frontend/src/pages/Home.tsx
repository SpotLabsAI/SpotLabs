import { useEffect, useState } from "react";
import ChatToAI from "../components/ChatToAI";
import Toolbar from "../components/Toolbar";
import "./../styles/main.scss";
import * as webllm from "@mlc-ai/web-llm";
import SupplyChainPlugin from "../plugin/supply_chain";

export type Tab = "planner" | "pwg" | "summary";

function Home({ chat, pluginManagerOpen }: { chat: webllm.ChatModule | null, pluginManagerOpen: () => void}) {
  const [tab, setTab] = useState<Tab>("planner");

  useEffect(() => {
    const blob = document.getElementById("blob");
    window.onpointermove = (event) => {
      const { clientX, clientY } = event;

      blob?.animate(
        {
          left: `${clientX}px`,
          top: `${clientY}px`,
        },
        { duration: 3000, fill: "forwards" }
      );
    };
  }, []);

  return (
    <div className="app">
      <Toolbar setPluginManagerOpen={pluginManagerOpen} />
      <div className="main-section">
        <div id="blob"></div>
        <div id="blur"></div>
        <div className="content"></div>
      </div>
      <ChatToAI chat={chat} plugin={SupplyChainPlugin}/>
    </div>
  );
}

export default Home;

import { useEffect, useState } from "react";
import ChatToAI from "../components/ChatToAI";
import Toolbar from "../components/Toolbar";
import "./../styles/main.scss";
import "./../styles/planner.scss";
import * as webllm from "@mlc-ai/web-llm";
import { Shapes } from "lucide-react";
import { plugin } from "../plugin/plugin";
import { getFacts } from "../lib/utils";
import { WritableFactContextType, useFact } from "../hooks/FactContext";
import SupplyChainPlugin from "../plugin/supply_chain";
import SustainabilityPlugin from "../plugin/sustainability";

function Home({
  chat,
  pluginManagerOpen,
}: {
  chat: webllm.ChatModule | null;
  pluginManagerOpen: () => void;
}) {
  const fact: WritableFactContextType = useFact();

  const [selected, setSelected] = useState<number>(-1);
  const [allPlugins, setAllPlugins] = useState<plugin[]>([]);

  useEffect(() => {
    setAllPlugins(
      (getFacts(fact)
        ?.filter((fact) => fact.fact.type === "__plugin")
        .map((fact) => JSON.parse(fact.fact.content)) ?? []).concat([SupplyChainPlugin, SustainabilityPlugin])
    );

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
        <div className="content">
          <div
            style={{
              margin: "35px",
            }}
          >
            <div className="notification planner">
              <div className="card-top">
                <Shapes size={40} />
                <h1>Available Spots</h1>
              </div>
              <div className="card-content">
                {allPlugins.map((plugin, index) => (
                  <div
                    key={plugin.name}
                    className={
                      "planner-entry" +
                      (index === selected ? " is-selected" : "")
                    }
                    onClick={(e) => {
                      setSelected(index);
                    }}
                  >
                    <div className="planner-entry-top">
                      <h1 className="planner-entry-title">{plugin.name}</h1>
                      <p className="planner-entry-date">{plugin.version}</p>
                    </div>
                    <p className="planner-entry-subtitle">
                      {plugin.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {selected === -1 ? (
        <div className="chat-to-ai">
          <div className="chat-container">
            <div className="chat-box">
              <div className="chat-message sender-ai initial">
                <p>
                  <span>Hey there, I'm AI!</span>
                  <br />
                  <span>
                    I'm here to help you with your plugins. Select a plugin to
                    chat with me!
                  </span>
                </p>
              </div>
            </div>
            <div className="input-container">
              <input
                type="text"
                placeholder="Please select a plugin to chat with me."
                disabled={true}
              />
            </div>
          </div>
        </div>
      ) : (
        <ChatToAI chat={chat} plugin={allPlugins[selected]} />
      )}
    </div>
  );
}

export default Home;

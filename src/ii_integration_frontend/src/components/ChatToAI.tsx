import { useEffect, useState } from "react";
import { WritableFactContextType, useFact } from "../hooks/FactContext";
import { getFacts } from "../lib/utils";
import * as webllm from "@mlc-ai/web-llm";
import { CornerDownRight } from "lucide-react";
import Dropdown from "./Dropdown";
import { plugin, plugin_func } from "../plugin/plugin";
import { outToFact } from "../lib/utils";
import { WritableAuthContextType, useAuth } from "../hooks/AuthContext";

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

type ChatMessage = {
  timestamp: number;
  error: boolean;
  content: string;
  sender: "user" | "ai";
};

function ChatToAI({
  chat,
  plugin,
}: {
  chat: webllm.ChatModule | null;
  plugin: plugin;
}) {
  const [value, setValue] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [dots, setDots] = useState<string>("");
  const [currFunc, setCurrFunc] = useState<plugin_func>(plugin.functions[0]);
  const fact: WritableFactContextType = useFact();
  const auth: WritableAuthContextType = useAuth();

  function addChatMessage(message: {
    content: string;
    sender: "user" | "ai";
    error?: boolean;
  }) {
    setLoading(message.sender === "user");
    setChatHistory((prev) => [
      ...prev,
      {
        timestamp: Date.now(),
        error: false,
        ...message,
      },
    ]);
  }

  useEffect(() => {
    setInterval(() => {
      setDots((prevDots) => {
        return prevDots.length >= 3 ? "" : prevDots + ".";
      });
    }, 1000);
  }, []);

  return (
    <div className="chat-to-ai">
      <div className="chat-container">
        <div className="chat-box">
          {chatHistory.length === 0 ? (
            <div className="chat-message sender-ai initial">
              Hello! I am your personal assistant. How can I help you today?
            </div>
          ) : (
            <></>
          )}
          {chatHistory.map((message, index) => {
            return (
              <div key={index}>
                {message.sender === "user" ? (
                  <p className="chat-message timestamp">
                    {new Date(message.timestamp).toLocaleTimeString(undefined, {
                      hour12: false,
                      hourCycle: "h24",
                    })}
                  </p>
                ) : (
                  <></>
                )}
                <div
                  key={index}
                  className={`chat-message sender-${message.sender === "user" ? "user" : "ai"
                    } ${message.error ? "error" : ""}`}
                >
                  {message.sender === "ai" ? (
                    <CornerDownRight
                      size={"1.2rem"}
                      style={{
                        minWidth: "1.2rem",
                        minHeight: "1.2rem",
                      }}
                    />
                  ) : (
                    <></>
                  )}
                  {message.content}
                </div>
              </div>
            );
          })}
        </div>
        {loading ? <p className="ai-hint">AI is thinking{dots}</p> : <></>}
        <div className="input-container">
          <Dropdown
            value={plugin.functions[0].name}
            options={plugin.functions.map((x) => x.name)}
            onChange={(e) => {
              setCurrFunc(
                plugin.functions.find((x) => x.name === e) || currFunc
              );
            }}
          />
          <input
            type="text"
            placeholder="Type your message..."
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
            }}
          />
          <button
            className={`send-button ${loading ? "loading" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              const val = value.trim();
              setValue("");
              addChatMessage({
                content: val,
                sender: "user",
              });
              const facts =
                getFacts(fact)
                  ?.filter((fact) =>
                    currFunc.accessible_facts.includes(fact.fact.type)
                  )
                  .map((fact) => {
                    return {
                      id: fact.id, fact: JSON.parse(fact.fact.content)
                    }
                  }) || [];
              const factsAsString = JSON.stringify(facts);
              const prompt = currFunc.prompt_transformer
                .replaceAll("$$facts$$", factsAsString)
                .replaceAll("$$input$$", val);
              console.log(prompt);
              (async () => {
                const res =
                  (await chat?.generate(prompt, (_, curr) => {
                    console.log(curr);
                  })) || "";
                await chat?.resetChat();
                outToFact(res, auth, fact, addChatMessage);
              })();
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatToAI;

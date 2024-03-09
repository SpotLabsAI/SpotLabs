import { useEffect, useState } from "react";
import { WritableAuthContextType, useAuth } from "../hooks/AuthContext";
import { WritableFactContextType, useFact } from "../hooks/FactContext";
import { getFacts } from "../lib/utils";
import * as webllm from "@mlc-ai/web-llm";
import { addFact, deleteFact, updateFact } from "../lib/fact";
import { CornerDownRight, LoaderCircle } from "lucide-react";

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

type ChatMessage = {
  timestamp: number;
  error: boolean;
  content: string;
  sender: "user" | "ai";
};

function ChatToAI({ chat }: { chat: webllm.ChatModule | null }) {
  const [value, setValue] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [dots, setDots] = useState<string>("");
  const auth: WritableAuthContextType = useAuth();
  const fact: WritableFactContextType = useFact();

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
                  className={`chat-message sender-${
                    message.sender === "user" ? "user" : "ai"
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
        {loading ? <p className="ai-hint">AI is typing{dots}</p> : <></>}
        <div className="input-container">
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
                  ?.filter((fact) => fact.fact.type === "cal")
                  .map((fact) => {
                    const data = JSON.parse(fact.fact.content);
                    return {
                      eventId: fact.id,
                      title: data.title,
                      date: data.date,
                      summary: data.summary,
                    };
                  }) || [];
              const factsAsString = JSON.stringify(facts);
              const prompt = `Current events are ${factsAsString}. ${val}`;
              (async () => {
                const res =
                  (await chat?.generate(prompt, (_, curr) => {
                    console.log(curr);
                  })) || "";

                let processed = res;
                if (res.includes("<<function>>")) {
                  processed = res.substring(res.indexOf("<<function>>") + 12);
                }

                try {
                  const name = processed.substring(0, 2);
                  const params = processed
                    .substring(3)
                    .slice(0, -1)
                    .split(",")
                    .map((param) => {
                      const [key, value] = param.split("=");
                      return {
                        key: key.trim(),
                        value: value
                          .trim()
                          .replaceAll("'", "")
                          .replaceAll('"', ""),
                      };
                    });

                  const paramsMap = new Map<string, string>();
                  params.forEach((param) => {
                    paramsMap.set(param.key, String(param.value));
                  });

                  switch (name) {
                    case "cc":
                      const newEvent = {
                        title: paramsMap.get("title") || "",
                        date: paramsMap.get("date") || "",
                        summary: paramsMap.get("summary") || "",
                      };
                      await addFact(
                        {
                          type: "cal",
                          content: JSON.stringify(newEvent),
                        },
                        fact,
                        auth
                      );
                      addChatMessage({
                        content: `Added "${newEvent.title}" to plan.`,
                        sender: "ai",
                      });
                      break;
                    case "cd":
                      const eventId = paramsMap.get("eventId");
                      if (eventId) {
                        const f = JSON.parse(
                          getFacts(fact)?.find(
                            (fact) => fact.id === BigInt(eventId)
                          )?.fact.content ?? "{title: 'Unknown'}"
                        ).title;
                        await deleteFact(BigInt(eventId), auth, fact);
                        addChatMessage({
                          content: `Successfully deleted "${f}".`,
                          sender: "ai",
                        });
                      } else {
                        addChatMessage({
                          content: `Could not find event to delete.`,
                          sender: "ai",
                        });
                      }
                      break;
                    case "cu":
                      const updatedEvent = {
                        title: paramsMap.get("title") || "",
                        date: paramsMap.get("date") || "",
                        summary: paramsMap.get("summary") || "",
                      };
                      const eventId2 = paramsMap.get("eventId");
                      if (eventId2) {
                        await updateFact(
                          BigInt(eventId2),
                          {
                            type: "cal",
                            content: JSON.stringify(updatedEvent),
                          },
                          fact,
                          auth
                        );
                        addChatMessage({
                          content: `Updated "${updatedEvent.title}".`,
                          sender: "ai",
                        });
                      } else {
                        await addFact(
                          {
                            type: "cal",
                            content: JSON.stringify(updatedEvent),
                          },
                          fact,
                          auth
                        );
                        addChatMessage({
                          content: `Added "${updatedEvent.title}" to plan.`,
                          sender: "ai",
                        });
                      }
                      break;
                    default:
                      console.log("Unrecognized command:", name);
                  }
                } catch (e) {
                  addChatMessage({
                    content: res,
                    sender: "ai",
                    error: false,
                  });
                }
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

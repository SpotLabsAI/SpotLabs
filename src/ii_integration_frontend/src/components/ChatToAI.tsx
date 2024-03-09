import { useState } from "react";
import { WritableAuthContextType, useAuth } from "../hooks/AuthContext";
import { WritableFactContextType, useFact } from "../hooks/FactContext";
import { getFacts } from "../lib/utils";
import * as webllm from "@mlc-ai/web-llm";
import { addFact, deleteFact, updateFact } from "../lib/fact";

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

function ChatToAI({ chat }: { chat: webllm.ChatModule | null }) {
  const [value, setValue] = useState<string>("");
  const auth: WritableAuthContextType = useAuth();
  const fact: WritableFactContextType = useFact();

  return (
    <div className="chat-to-ai">
      <div className="chat-container">
        <div className="chat-box">{/* Add chat history display here */}</div>
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
            onClick={(e) => {
              e.preventDefault();
              console.log("ChatToAI.tsx: value:", value);
              const facts = getFacts(fact)?.filter((fact) => fact.fact.type === "cal").map((fact) => {
                const data = JSON.parse(fact.fact.content);
                return {
                  eventId: fact.id,
                  title: data.title,
                  date: data.date,
                  summary: data.summary,
                };
              }) || [];
              const factsAsString = JSON.stringify(facts);
              const prompt = `Current events are ${factsAsString}. ${value}`;
              console.log(prompt);
              (async () => {
                const res = await chat?.generate(prompt, (_, curr) => {
                  console.log(curr);
                }) || "";
                chat?.resetChat();
                console.log(res);

                // Remove all letters before and including substring "<<function>>"
                let processed = res;
                if (res.includes("<<function>>")) {
                  processed = res.substring(res.indexOf("<<function>>") + 12);
                }

                // Process command of format name(param=value, param2=val, ...)

                const name = processed.substring(0, 2);
                const params = processed.substring(3).slice(0, -1).split(",").map((param) => {
                  const [key, value] = param.split("=");
                  return { key: key.trim(), value: value.trim().replaceAll("'", "").replaceAll("\"", "") };
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
                    const res = await addFact({
                      type: "cal",
                      content: JSON.stringify(newEvent),
                    }, fact, auth);
                    console.log(res);
                    break;
                  case "cd":
                    const eventId = paramsMap.get("eventId");
                    if (eventId) {
                      const res = await deleteFact(BigInt(eventId), auth, fact);
                      console.log(res);
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
                      const res = await updateFact(BigInt(eventId2), {
                        type: "cal",
                        content: JSON.stringify(updatedEvent),
                      }, fact, auth);
                      console.log(res);
                    } else {
                      const res = await addFact({
                        type: "cal",
                        content: JSON.stringify(updatedEvent),
                      }, fact, auth);
                      console.log(res);
                    }
                    break;
                  default:
                    console.log("Unrecognized command:", name);
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

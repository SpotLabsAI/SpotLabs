import { useEffect } from "react";
import ChatToAI from "../components/ChatToAI";
import Toolbar from "../components/Toolbar";
import "./../styles/main.scss";
import { CalendarDays, User2 } from "lucide-react";
import Planner from "../cards/Planner";
import Biography from "../cards/Biography";
import * as webllm from "@mlc-ai/web-llm";

function Home({ chat }: { chat: webllm.ChatModule | null }) {
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
      <Toolbar />
      <div className="main-section">
        <div id="blob"></div>
        <div id="blur"></div>
        <div className="content">
          <div className="tile is-ancestor is-top">
            <div className="tile is-vertical is-6">
              <div className="tile">
                <div className="tile is-parent is-vertical">
                  <article className="tile is-child notification bio">
                    <div className="card-top">
                      <div className="card-dot">
                        <User2 />
                      </div>
                      <h1>Biography</h1>
                    </div>
                    <Biography />
                  </article>
                </div>
              </div>
            </div>
            <div className="tile is-parent">
              <article className="tile is-child notification planner">
                <div className="card-top">
                  <div className="card-dot">
                    <CalendarDays />
                  </div>
                  <h1>Planner</h1>
                </div>
                <Planner />
              </article>
            </div>
          </div>
        </div>
      </div>
      <ChatToAI chat={chat}/>
    </div>
  );
}

export default Home;

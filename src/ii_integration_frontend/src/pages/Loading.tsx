import { useEffect } from "react";
import { WritableAuthContextType, useAuth } from "../hooks/AuthContext";
import { login } from "../lib/auth";
import "./../styles/main.scss";
import "./../styles/loading.scss";
import { LoaderCircle } from "lucide-react";
import * as webllm from "@mlc-ai/web-llm";

export type LoadingReport = {
  report: webllm.InitProgressReport | null;
  done: boolean;
};

const Loading = ({ report }: { report: LoadingReport }) => {
  const auth: WritableAuthContextType = useAuth();

  const map = new Map<string, string>();
  map.set("anonymous", "Awaiting Login...");
  map.set("initializing-auth", "Creating Auth Client...");
  map.set("initializing-crypto", "Initializing Crypto...");
  map.set("synchronizing", "Synchronizing...");
  map.set("error", "Error! Please refresh the page.");

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

  const convertToPercentage = (decimal: number) => {
    const percentage = (decimal * 100).toFixed(1); // Convert decimal to percentage with 1 decimal place
    return `${percentage}%`; // Add the percentage sign
  };

  return (
    <div className="app">
      <div className="main-section">
        <div id="blob"></div>
        <div id="blur"></div>
        <div className="loading-content">
          {auth.value.state === "anonymous" ? (
            <>
              <h2>Please Log In</h2>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  login(auth);
                }}
              >
                Login
              </button>
            </>
          ) : (
            <>
              <h2>Loading...</h2>
              <p>Loading may take a while. A GPU with 12GB of VRAM is needed.</p>
              {auth.value.state !== "initialized" ? (
                <p>{map.get(auth.value.state)}</p>
              ) : (
                <></>
              )}
              {!report.done ? (
                (report.report?.progress ?? 1) === 1 ? (
                  <>
                    <p>Compiling LLM...</p>
                    <p className="feint">
                      {report.report?.text ?? "Compiling..."}
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      Download Progress:{" "}
                      {convertToPercentage(report.report?.progress ?? 0)}
                    </p>
                    <p className="feint">
                      {report.report?.text ?? "Downloading..."}
                    </p>
                  </>
                )
              ) : (
                <></>
              )}
              <LoaderCircle size={"50px"} style={{
                marginBottom: "50px"
              }}/>
              <iframe
                width="560"
                height="315"
                src="https://www.youtube.com/embed/UkWxtTFz3OM?si=7d1BFlGSpKVO2e2e&autoplay=1"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Loading;

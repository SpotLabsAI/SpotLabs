import { useEffect, useState } from "react";
import { WritableFactContextType, useFact } from "../hooks/FactContext";
import { StoredFactModel } from "../lib/fact";
import { getFacts } from "../lib/utils";
import Chart from "../components/ForceGraph";

const Visualizer = ({ close }: { close: () => void }) => {
  const fact_context: WritableFactContextType = useFact();

  const [facts, setFacts] = useState<StoredFactModel[]>([]);

  useEffect(() => {
    setFacts(getFacts(fact_context) ?? []);
  }, []);

  function generateRandomLinks(facts: StoredFactModel[]): any[] {
    const links = [];
    for (let i = 0; i < facts.length; i++) {
      for (let j = 0; j < facts.length; j++) {
        if (i !== j) {
          links.push({
            source: facts[i].id.toString(),
            target: facts[j].id.toString(),
            value: Math.random() * 10,
          });
        }
      }
    }
    return links;
  }

  // Calculate the width and height of the chart
  const width = window.innerWidth;
  const height = window.innerHeight;

  return (
    <div className="app">
      <Chart
        data={{
          nodes: facts.map((fact) => ({
            id: fact.id.toString(),
            group: fact.fact.type,
          })),
          links: generateRandomLinks(facts),
        }}
        width={width}
        height={height}
      />
      <button
        style={{
          // Floating button at bottom middle
          position: "fixed",
          bottom: "40px",
          left: "50%",
          transform: "translateX(-50%)",
        }}
        onClick={() => close()}
      >
        Close
      </button>
    </div>
  );
};

export default Visualizer;

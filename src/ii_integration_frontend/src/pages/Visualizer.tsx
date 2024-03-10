import React from "react";
import { WritableFactContextType, useFact } from "../hooks/FactContext";
import { StoredFactModel } from "../lib/fact";
import { getFacts } from "../lib/utils";
import Chart from "../components/ForceGraph";

const Map = React.memo(({ data, width, height, close }: any) => {
  return (
    <div className="app">
      <Chart
        //@ts-ignore
        data={data}
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
});

const Visualizer = React.memo(({ close }: { close: () => void }) => {
  const fact_context: WritableFactContextType = useFact();

  const f = getFacts(fact_context) ?? [];
  //@ts-ignore
  const f2 = {
    nodes: f.map((fact: StoredFactModel) => ({
      id: fact.id.toString(),
      group: fact.fact.type,
    })),
    links: [],
  };
  // Calculate the width and height of the chart
  const width = window.innerWidth;
  const height = window.innerHeight;

  return <Map data={f2} width={width} height={height} close={close} />;
});

export default Visualizer;

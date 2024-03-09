import { plugin } from "./plugin";

const SupplyChainPlugin: plugin = {
  name: "Supply Chain",
  description: "A plugin for supply chain management.",
  version: "0.1.0",
  fact_id: "supply_chain",
  functions: [
    {
      name: "Query",
      description: "Query the supply chain.",
      accessible_facts: ["supply_chain"],
      prompt_transformer: (facts: string, input: string) => "My Facts: " + facts + ", My Input: " + input,
    },
    {
      name: "Update",
      description: "Update the supply chain.",
      accessible_facts: ["supply_chain"],
      prompt_transformer: (facts: string, input: string) => "My Facts: " + facts + ", My Input: " + input,
    },
  ],
};

export default SupplyChainPlugin;

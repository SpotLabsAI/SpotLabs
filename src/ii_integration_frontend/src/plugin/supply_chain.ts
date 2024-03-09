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
      prompt_transformer: (facts: string, input: string) => input + " and return the function create_supply_chain",
    },
    {
      name: "Update",
      description: "Update the supply chain.",
      accessible_facts: ["supply_chain"],
      prompt_transformer: (facts: string, input: string) => input + " and return the function update_supply_chain",
    },
    {
      name: "Create",
      description: "Create an object to add to the supply chain.",
      accessible_facts: ["supply_chain"],
      prompt_transformer: (facts: string, input: string) => input 
    },
    {
      name: "Delete",
      description: "Delete an object from the supply chain list",
      accessible_facts: ["supply_chain"],
      prompt_transformer: (facts: string, input: string) => input + " from []"
    },
  ],
};

export default SupplyChainPlugin;

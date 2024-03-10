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
      prompt_transformer: "$$input$$ and return the function query_supply_chain",
    },
    {
      name: "Update",
      description: "Update the supply chain.",
      accessible_facts: ["supply_chain"],
      prompt_transformer: "$$input$$ the following data: [{send children}, {12-01-2024}, {12-02-2024}, {China}, {children yummy}] and return the function update_supply_chain",
    },
    {
      name: "Create",
      description: "Create an object to add to the supply chain.",
      accessible_facts: ["supply_chain"],
      prompt_transformer: "$$input$$ and return the function create_supply_chain" 
    },
    {
      name: "Delete",
      description: "Delete an object from the supply chain list",
      accessible_facts: ["supply_chain"],
      prompt_transformer: "$$input$$ from [] Callfunction delete_supply_chain"
    },
  ],
};

export default SupplyChainPlugin;

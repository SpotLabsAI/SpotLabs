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
      prompt_transformer: "$$input$$ from the following data structure: [{title=aboey, origin=UK}, {title=baba, origin=US}, {title=kitchen, origin=UK}]",
    },
    {
      name: "Update",
      description: "Update the supply chain.",
      accessible_facts: ["supply_chain"],
      prompt_transformer: "My Facts: $$facts$$, My Input: $$input$$",
    },
    {
      name: "Create",
      description: "Create an object to add to the supply chain.",
      accessible_facts: ["supply_chain"],
      prompt_transformer: "$$input$$" 
    },
    {
      name: "Delete",
      description: "Delete an object from the supply chain list",
      accessible_facts: ["supply_chain"],
      prompt_transformer: "$$input$$ from the following data structure: [{title=aboey, origin=UK}, {title=baba, origin=US}, {title=kitchen, origin=UK}]"
    },
  ],
};

export default SupplyChainPlugin;

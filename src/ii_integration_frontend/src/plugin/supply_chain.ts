import { getFacts } from "../lib/utils";
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
      prompt_transformer: "My input is: $$input$$. Currently available facts are $$facts$$",
    },
    {
      name: "Update",
      description: "Update a specified supply chain with new values.",
      accessible_facts: ["supply_chain"],
      prompt_transformer: "$$input$$ from $$facts$$ Call the function update_supply_chain. You will only update the specified field.",
    },
    {
      name: "Create",
      description: "Create an object to add to the supply chain.",
      accessible_facts: ["supply_chain"],
      prompt_transformer: "$$input$$ Call the function create_supply_chain"
    },
    {
      name: "Delete",
      description: "Delete an object from the supply chain list",
      accessible_facts: ["supply_chain"],
      prompt_transformer: "$$input$$ from $$facts$$ Call the function delete_supply_chain"
    },
  ],
};

export default SupplyChainPlugin;

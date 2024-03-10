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
      prompt_transformer: "My facts are: $$facts$$. My input is: $$input$$",
    },
    {
      name: "Update",
      description: "Update the supply chain.",
      accessible_facts: ["supply_chain"],
      prompt_transformer: "$$input$$ the following data: [\"title\": \"Coffee Beans\", \"deliverDate\": \"11-01-2024\", \"receiveDate\": \"11-02-2024\", \"origin\": \"Medan, Indonesia\", \"description\": \"Coffee Beans\"] Call the function update_supply_chain",
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
      prompt_transformer: "$$input$$ from "
    },
  ],
};

export default SupplyChainPlugin;

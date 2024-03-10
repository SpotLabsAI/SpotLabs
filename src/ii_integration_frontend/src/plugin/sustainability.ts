import { plugin } from "./plugin";

const SustainabilityPlugin: plugin = {
    name: "Company Sustainability Reporter",
    description: "A plugin to support reporting sustainability levels for the company based off of carbon footprint, resource efficiency, ethical standards and coorperate governance.",
    version: "0.1.0",
    fact_id: "sustainability",
    functions: [
        {
            name: "ReportSustainability",
            description: "Input sustainibility facts and calculate the company's total sustainability levels",
            accessible_facts: ["sustainability"],
            prompt_transformer: "Company Sustainability Facts: $$facts$$. Add these factors up and divide the total by the total number of factors provided to get the total sustainability score. Return this score in the function report_sustainability"
        
        }
    ]
}
export default SustainabilityPlugin;
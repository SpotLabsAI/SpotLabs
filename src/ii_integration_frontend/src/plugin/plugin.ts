export type plugin_func = {
  name: string;
  description: string;
  accessible_facts: string[];
  prompt_transformer: (facts: string, input: string) => string;
};

export type plugin = {
  name: string;
  description: string;
  version: string;
  fact_id: string;
  functions: plugin_func[];
};

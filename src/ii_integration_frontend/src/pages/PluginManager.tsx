import { useEffect, useState } from "react";
import { getFacts } from "../lib/utils";
import { WritableFactContextType, useFact } from "../hooks/FactContext";
import { plugin } from "../plugin/plugin";
import "./../styles/glyph.scss";
import "./../styles/form.scss";
import validator from "@rjsf/validator-ajv8";
import Form from "@rjsf/core";
import { RJSFSchema } from "@rjsf/utils";

const schema: RJSFSchema = {
  $schema: "http://json-schema.org/draft-04/schema#",
  type: "object",
  properties: {
    name: {
      type: "string",
    },
    description: {
      type: "string",
    },
    version: {
      type: "string",
    },
    fact_id: {
      type: "string",
    },
    functions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: {
            type: "string",
          },
          description: {
            type: "string",
          },
          accessible_facts: {
            type: "array",
            items: {
              type: "string",
            },
          },
          prompt_transformer: {
            type: "string",
          },
        },
        required: [
          "name",
          "description",
          "accessible_facts",
          "prompt_transformer",
        ],
      },
    },
  },
  required: ["name", "description", "version", "fact_id", "functions"],
};

const PluginManager = ({ close }: { close: () => void }) => {
  const fact: WritableFactContextType = useFact();
  const [plugins, setPlugins] = useState<plugin[]>([]);

  const [show, setShow] = useState<boolean>(false);

  useEffect(() => {
    setPlugins(
      getFacts(fact)
        ?.filter((fact) => fact.fact.type === "__plugin")
        .map((fact) => JSON.parse(fact.fact.content) as plugin) ?? []
    );
  }, []);

  return (
    <div className="app">
      <div
        className="main-section"
        style={{
          margin: "50px",
        }}
      >
        <h1
          style={{
            color: "white",
          }}
        >
          Plugin Manager
        </h1>
        <div>
          {plugins.map((plugin) => (
            <div key={plugin.name}>
              <h2>{plugin.name}</h2>
              <p>{plugin.description}</p>
            </div>
          ))}
        </div>
        <button
          onClick={(e) => {
            setShow(true);
          }}
        >
          Create New
        </button>
        {show ? <Form schema={schema} validator={validator} /> : <></>}
      </div>
    </div>
  );
};

export default PluginManager;

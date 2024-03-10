import { useEffect, useState } from "react";
import { getFacts } from "../lib/utils";
import { WritableFactContextType, useFact } from "../hooks/FactContext";
import { plugin } from "../plugin/plugin";
import "./../styles/glyph.scss";
import "./../styles/form.scss";
import validator from "@rjsf/validator-ajv8";
import Form from "@rjsf/core";
import { RJSFSchema } from "@rjsf/utils";
import { addFact, deleteFact } from "../lib/fact";
import { WritableAuthContextType, useAuth } from "../hooks/AuthContext";
import { Trash } from "lucide-react";

const schema: RJSFSchema = {
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
  const auth: WritableAuthContextType = useAuth();
  const [plugins, setPlugins] = useState<{ i: bigint; p: plugin }[]>([]);

  const [show, setShow] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  function updatePlugins() {
    setPlugins(
      getFacts(fact)
        ?.filter((fact) => fact.fact.type === "__plugin")
        .map((fact) => {
          return { i: fact.id, p: JSON.parse(fact.fact.content) as plugin };
        }) ?? []
    );
  }

  useEffect(() => {
    updatePlugins();
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
          {loading ? "Loading..." : "Plugin Manager"}
        </h1>
        <a style={{
          color: "white",
          fontStyle: "italic",
          textDecoration: "underline",
        }} href="https://spotlabsai.github.io/" target="_blank">View documentation.</a>
        <div>
          {plugins.map((plugin) => (
            <div key={plugin.i} className="plugin-card" style={{
              marginTop: "20px",
            }}>
              <div>
                <h2>
                  {plugin.p.name} v{plugin.p.version}
                </h2>
                <p>{plugin.p.description}</p>
              </div>
              <div className="delete-icon">
                <Trash
                  size={30}
                  onClick={async (e) => {
                    setLoading(true);
                    await deleteFact(plugin.i, auth, fact);
                    close();
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        <button
          style={{
            display: show ? "none" : "block",
            marginTop: "20px",
          }}
          onClick={(e) => {
            setShow(true);
          }}
        >
          Create New
        </button>
        {show ? (
          <Form
            schema={schema}
            validator={validator}
            onSubmit={async (d, e) => {
              setShow(false);
              setLoading(true);
              await addFact(
                {
                  type: "__plugin",
                  content: JSON.stringify(d.formData),
                },
                fact,
                auth
              );
              close();
            }}
          />
        ) : (
          <></>
        )}
        <button
          onClick={(e) => {
            close();
          }}
        >
          Return
        </button>
      </div>
    </div>
  );
};

export default PluginManager;

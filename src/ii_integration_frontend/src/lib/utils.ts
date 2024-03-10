import { ActorSubclass } from "@dfinity/agent";
import type {
  AuthState,
  InitializedAuthState,
  WritableAuthContextType,
} from "../hooks/AuthContext";
import { _SERVICE } from "../../../declarations/ii_integration_backend/ii_integration_backend.did";
import { CryptoService } from "./crypto";
import { FactState, InitializedFactState, WritableFactContextType } from "../hooks/FactContext";
import { StoredFactModel, deleteFact, updateFact } from "./fact";
import { addFact } from "./fact";

export function getActor(writable: WritableAuthContextType): ActorSubclass<_SERVICE> {
  return castAuth(writable.value)?.actor as ActorSubclass<_SERVICE>;
}

export function getCrypto(writable: WritableAuthContextType): CryptoService {
  return castAuth(writable.value)?.crypto as CryptoService;
}

export function getFacts(writable: WritableFactContextType): StoredFactModel[] | undefined {
  return castFact(writable.value)?.list;
}

export function castAuth(auth: AuthState): InitializedAuthState | null {
  if (auth.state !== "initialized") {
    return null;
  }
  return auth as InitializedAuthState;
}

export function castFact(fact: FactState): InitializedFactState | null {
  if (fact.state !== "loaded") {
    return null;
  }
  return fact as InitializedFactState;
}
export function outToFact(output: string, auth: WritableAuthContextType, fact: WritableFactContextType, factID: bigint) {
  let funcName = "";
  let factString = "";
  const json = JSON.parse(output);
  funcName = json.function;

  const regex = /\{(.+?)\}/g; // Matches all occurrences of curly brackets and captures the content inside
    const matches = output.match(regex); // Finding all matches in the input string
    if (matches && matches.length >= 2) {
        factString = matches[0] + matches.slice(-1); // Returning the content captured between the first and last occurrences of curly brackets
    } else {
        throw new Error("Unable to parse output into fact"); // If less than two curly brackets are found, return null
    }
    switch (funcName) {
      case "create_supply_chain":
        let contents = json.args;
        const createSupplyChain = {
          title: contents.title,
          deliveryDate: contents.deliverDate,
          receiveDate: contents.receiveDate,
          origin: contents.origin,
          description: contents.description,
        };
        const res = addFact(
          {
            type: "supply_chain",
            content: JSON.stringify(createSupplyChain),
          },
          fact,
          auth
        );
      case "update_supply_chain":
        let contents2 = json.args;
        const updateSupplyChain = {
          title: contents.title,
          deliveryDate: contents.deliverDate,
          receiveDate: contents.receiveDate,
          origin: contents.origin,
          description: contents.description,
        };
        const res2 = updateFact(
          factID,
          {
            type: "supply_chain",
            content: JSON.stringify(updateSupplyChain),
          },
          fact,
          auth
        );
      case "delete_supply_chain":
        const res3 = deleteFact(factID, auth, fact);
      case "report_sustainability":
        let contents4 = json.args;
        const reportSustainability = {
          sustainabilityScore: contents4.sustainabilityScore
        }
        const res4 = addFact(
          {
            type: "supply_chain",
            content: JSON.stringify(reportSustainability),
          },
          fact,
          auth
        );
      default:
        throw new Error("Command unrecognized: ", json.function)

    }
      

}




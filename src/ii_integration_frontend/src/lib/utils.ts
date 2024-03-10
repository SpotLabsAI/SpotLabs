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
export function outToFact(output: string, auth: WritableAuthContextType, fact: WritableFactContextType) {
  let funcName = "";
  let factString = "";
  let json;
  try {
    json = JSON.parse(output);
  } catch {
    throw new Error("Unable to parse output into JSON");
  }

  funcName = json.function;
    switch (funcName) {
      case "create_supply_chain":
        let contents = json.args[0];
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
        break;
      case "update_supply_chain":
        let contents2 = json.args[0];
        const updateSupplyChain = {
          id: contents2.id,
          title: contents2.title,
          deliveryDate: contents2.deliverDate,
          receiveDate: contents2.receiveDate,
          origin: contents2.origin,
          description: contents2.description,
        };
        const res2 = updateFact(
          BigInt(contents2.id),
          {
            type: "supply_chain",
            content: JSON.stringify(updateSupplyChain),
          },
          fact,
          auth
        );
        break;
      case "delete_supply_chain":
        let contents3 = json.args[0];
        const res3 = deleteFact(BigInt(contents3.id), auth, fact);
        console.log(res3);
        break;
      case "report_sustainability":
        let contents4 = json.args[0];
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
        break;
      default:
        throw new Error("Command unrecognized: ", json.function)

    }
      

}




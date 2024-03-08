import { ActorSubclass } from "@dfinity/agent";
import type {
  AuthState,
  InitializedAuthState,
  WritableAuthContextType,
} from "../hooks/AuthContext";
import { _SERVICE } from "../../../declarations/ii_integration_backend/ii_integration_backend.did";
import { CryptoService } from "./crypto";
import { FactState, InitializedFactState, WritableFactContextType } from "../hooks/FactContext";
import { StoredFactModel } from "./fact";

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


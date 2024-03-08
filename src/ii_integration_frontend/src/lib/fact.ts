import { ActorSubclass } from "@dfinity/agent";
import {
  EncryptedFact,
  _SERVICE,
} from "../../../declarations/ii_integration_backend/ii_integration_backend.did";
import { WritableFactContextType } from "../hooks/FactContext";
import { CryptoService } from "./crypto";
import { AuthState, WritableAuthContextType } from "../hooks/AuthContext";
import { getActor, getCrypto } from "./utils";

export interface StoredFactModel {
  id: bigint;
  fact: FactModel;
}

export interface FactModel {
  type: string;
  content: string;
}

export async function serialize(
  fact: FactModel,
  cryptoService: CryptoService
): Promise<string> {
  return await cryptoService.encrypt(JSON.stringify(fact));
}

export async function deserialize(
  efact: EncryptedFact,
  cryptoService: CryptoService
): Promise<StoredFactModel> {
  const serializedFact = await cryptoService.decrypt(efact.encrypted_text);
  const deserializedFact: FactModel = JSON.parse(serializedFact);
  return {
    id: efact.id,
    fact: deserializedFact,
  };
}

let factPollerHandle: ReturnType<typeof setInterval> | null;

async function decryptFacts(
  facts: EncryptedFact[],
  cryptoService: CryptoService
): Promise<StoredFactModel[]> {
  return await Promise.all(facts.map((e) => deserialize(e, cryptoService)));
}

function updateFacts(facts: StoredFactModel[], factsStore: WritableFactContextType) {
  factsStore.updateValue({
    state: "loaded",
    list: facts,
  });
}

export async function refreshFacts(
  actor: ActorSubclass<_SERVICE>,
  cryptoService: CryptoService,
  factsStore: WritableFactContextType
) {
  const encryptedFacts = await actor.get_facts();

  // did we get logged out?
  if (!cryptoService.isInitialized()) return;

  const facts = await decryptFacts(encryptedFacts, cryptoService);
  updateFacts(facts, factsStore);
}

export async function addFact(
  fact: FactModel,
  factsStore: WritableFactContextType,
  authStore: WritableAuthContextType
): Promise<StoredFactModel> {
  const actor = getActor(authStore);
  const crypto = getCrypto(authStore);
  const n = await actor.add_fact(await serialize(fact, crypto));
  await refreshFacts(actor, crypto, factsStore);
  return {
    id: n.id,
    fact,
  };
}

export async function updateFact(
  id: bigint,
  fact: FactModel,
  factsStore: WritableFactContextType,
  authStore: WritableAuthContextType,
) {
  const actor = getActor(authStore);
  const crypto = getCrypto(authStore);
  await actor.update_fact({
    id,
    encrypted_text: await serialize(fact, crypto),
  });
  await refreshFacts(actor, crypto, factsStore);
}

export async function deleteFact(id: bigint, auth: WritableAuthContextType, fact: WritableFactContextType) {
  const actor = getActor(auth);
  const crypto = getCrypto(auth);
  await actor.delete_fact(id);
  await refreshFacts(actor, crypto, fact)
}

export async function onAuthChange(
  auth: AuthState,
  fact: WritableFactContextType
) {
  if (auth.state === "initialized") {
    if (factPollerHandle !== null) {
      clearInterval(factPollerHandle);
      factPollerHandle = null;
    }

    fact.updateValue({
      state: "loading",
    });
    try {
      await refreshFacts(auth.actor, auth.crypto, fact).catch((e) =>
        console.log(e, "Could not poll facts.")
      );

      factPollerHandle = setInterval(async () => {
        await refreshFacts(auth.actor, auth.crypto, fact).catch((e) =>
          console.log(e, "Could not poll facts.")
        );
      }, 3000);
    } catch {
      fact.updateValue({
        state: "error",
      });
    }
  } else if (auth.state === "anonymous" && factPollerHandle !== null) {
    clearInterval(factPollerHandle);
    factPollerHandle = null;
    fact.updateValue({
      state: "uninitialized",
    });
  }
}

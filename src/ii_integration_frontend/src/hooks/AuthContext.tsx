import React, { useState, useContext } from "react";
import { AuthClient } from "@dfinity/auth-client";
import { CryptoService } from "../lib/crypto";
import { useFact } from "./FactContext";
import { onAuthChange } from "../lib/fact";

export type InitializedAuthState = {
  state: "initialized";
  actor: any;
  client: AuthClient;
  crypto: CryptoService;
};

export type AuthState =
  | {
      state: "initializing-auth";
    }
  | {
      state: "anonymous";
      actor: any;
      client: AuthClient;
    }
  | {
      state: "initializing-crypto";
      actor: any;
      client: AuthClient;
    }
  | {
      state: "synchronizing";
      actor: any;
      client: AuthClient;
    }
  | {
      state: "initialized";
      actor: any;
      client: AuthClient;
      crypto: CryptoService;
    }
  | {
      state: "error";
      error: string;
    };

export interface WritableAuthContextType {
  value: AuthState;
  updateValue: (newValue: AuthState) => void;
}

const WritableAuthContext = React.createContext<WritableAuthContextType | undefined>(
  undefined
);

export const useAuth = () => {
  const context = useContext(WritableAuthContext);
  if (!context) {
    throw new Error("useAuth must be used within a WritableAuthContext");
  }
  return context;
};

export const AuthProvider: React.FC = ({ children }: any) => {
  const [value, setValue] = useState<AuthState>({ state: "initializing-auth" });
  const fact = useFact();

  const updateValue = (newValue: AuthState) => {
    setValue(newValue);
    onAuthChange(newValue, fact);
  };

  return (
    <WritableAuthContext.Provider value={{ value, updateValue }}>
      {children}
    </WritableAuthContext.Provider>
  );
};

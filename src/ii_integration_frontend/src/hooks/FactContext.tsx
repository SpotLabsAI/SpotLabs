import React, { useState, useContext } from "react";
import { StoredFactModel } from "../lib/fact";

export type InitializedFactState = {
  state: "loaded";
  list: StoredFactModel[];
};

export type FactState =
  | {
      state: "uninitialized";
    }
  | {
      state: "loading";
    }
  | {
      state: "loaded";
      list: StoredFactModel[];
    }
  | {
      state: "error";
    };

export interface WritableFactContextType {
  value: FactState;
  updateValue: (newValue: FactState) => void;
}

const WritableFactContext = React.createContext<WritableFactContextType | undefined>(
  undefined
);

export const useFact = () => {
  const context = useContext(WritableFactContext);
  if (!context) {
    throw new Error("useFact must be used within a FactProvider");
  }
  return context;
};

export const FactProvider: React.FC = ({ children }: any) => {
  const [value, setValue] = useState<FactState>({ state: "uninitialized" });

  const updateValue = (newValue: FactState) => {
    setValue(newValue);
  };

  return (
    <WritableFactContext.Provider value={{ value, updateValue }}>
      {children}
    </WritableFactContext.Provider>
  );
};

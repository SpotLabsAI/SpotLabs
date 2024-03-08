import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.scss";
import { AuthProvider } from "./hooks/AuthContext";
import { FactProvider } from "./hooks/FactContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <FactProvider>
    <AuthProvider>
      <App />
    </AuthProvider>
  </FactProvider>
);

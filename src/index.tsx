import React from "react";
import ReactDOM from "react-dom/client";
import { CatalogUIApp } from "./catalog/App";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <React.StrictMode>
    <CatalogUIApp />
  </React.StrictMode>,
);

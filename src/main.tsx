import React from "react";
import ReactDOM from "react-dom/client";
import Layout from "./layout";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./global.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <Layout>
        <App />
      </Layout>
    </BrowserRouter>
  </React.StrictMode>
);

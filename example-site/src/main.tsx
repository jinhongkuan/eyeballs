import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MantineProvider
      theme={{
        defaultRadius: "1rem",
        fontSizes: {
          xs: "16px",
          sm: "16px",
          md: "16px",
          lg: "16px",
          xl: "16px",
        },
      }}
    >
      <App />
    </MantineProvider>
  </React.StrictMode>
);

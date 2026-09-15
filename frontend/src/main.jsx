import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import '@fontsource/quicksand/400.css'
import '@fontsource/quicksand/500.css'
import '@fontsource/quicksand/600.css'
import '@fontsource/quicksand/700.css'
import "./index.css";
import App from "./App.jsx";
import { AgentProvider } from "./contexts/AgentContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AgentProvider>
      <App />
    </AgentProvider>
  </StrictMode>
);

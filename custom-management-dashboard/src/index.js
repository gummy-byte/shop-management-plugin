import { createRoot } from "react-dom/client";
import React from 'react';
import App from "./App";
import './index.css';

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("cmd-root");
  if (container) {
      const root = createRoot(container);
      root.render(<App />);
  }
});

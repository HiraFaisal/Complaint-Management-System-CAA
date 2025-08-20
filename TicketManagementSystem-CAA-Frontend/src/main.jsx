import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
// jo bhi css ki file daalni ho yahan dalegy bas or kahi nhi
import "./assets/output.css";
// agya images nhi arhi dekho public ke folder se jab bhi koi cheez linik krwate to /public nhi likhte srf / se start krte bas
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

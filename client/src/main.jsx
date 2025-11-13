iimport React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";
import App from "./App.jsx";
import "./index.css";

// ✅ CRITICAL: Configure axios to use the correct backend URL
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
axios.defaults.withCredentials = true;

console.log('🔧 Axios baseURL configured:', axios.defaults.baseURL); // Debug log

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
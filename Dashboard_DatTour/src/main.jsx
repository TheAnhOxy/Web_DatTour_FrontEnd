import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import App from "./App.jsx";
import "./index.css";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ToastContainer
        position="top-right"
        autoClose={2800}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover={false}
        theme="dark"
        toastClassName={() =>
          "!rounded-2xl !border !border-white/10 !bg-slate-950/95 !shadow-[0_18px_60px_rgba(15,23,42,0.28)] !backdrop-blur-md !px-4 !py-3"
        }
        bodyClassName={() => "!m-0 !p-0 !text-sm !font-medium !text-slate-100"}
        progressClassName={() => "!bg-gradient-to-r !from-cyan-400 !via-blue-500 !to-indigo-500"}
      />
    </QueryClientProvider>
  </React.StrictMode>,
);

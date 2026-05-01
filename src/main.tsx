import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";

import { App } from "./app/App";
import { CurrentTimeProvider } from "./app/providers/current-time-provider";
import { store } from "./app/store";
import "./shared/i18n";
import "./shared/styles/index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <CurrentTimeProvider>
        <App />
      </CurrentTimeProvider>
    </Provider>
  </React.StrictMode>,
);

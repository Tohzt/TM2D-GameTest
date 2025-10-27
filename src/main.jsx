import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import WebApp from "@twa-dev/sdk";
import "./index.css";

// Initialize Telegram SDK BEFORE React renders
// These calls are safe even if params aren't set yet
try {
	WebApp.ready();
	WebApp.expand();
	WebApp.setHeaderColor("#667eea");
	WebApp.enableClosingConfirmation();
} catch (e) {
	// If in non-Telegram environment, just continue
	console.log("Telegram WebApp not available");
}

ReactDOM.createRoot(document.getElementById("root")).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
);

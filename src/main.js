import Phaser from "phaser";
import MenuScene from "./menu.js";
import FlappyScene from "./games/flappy/index.js";
import TapsScene from "./games/taps/index.js";
import WebApp from "@twa-dev/sdk";

// Initialize Telegram WebApp
WebApp.ready();

// Expand to fullscreen (removes header)
WebApp.expand();

// Optional: Make the header background match your game
WebApp.setHeaderColor("#1a237e"); // matches menu background

// Optional: Enable closing confirmation
WebApp.enableClosingConfirmation();

// Create Phaser game
const game = new Phaser.Game({
	type: Phaser.AUTO,
	scale: {
		mode: Phaser.Scale.FIT,
		autoCenter: Phaser.Scale.CENTER_BOTH,
		width: 400,
		height: 600,
	},
	parent: "game-container",
	backgroundColor: "#1a237e",
	physics: {
		default: "arcade",
		arcade: {
			gravity: { y: 0 },
			debug: false,
		},
	},
	scene: [MenuScene, FlappyScene, TapsScene],
});

// Optional: Log if running in Telegram
console.log("Running in Telegram:", WebApp.platform !== "unknown");

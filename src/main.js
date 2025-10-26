import Phaser from "phaser";
import MenuScene from "./menu.js";
import FlappyScene from "./games/flappy/index.js";
import TapsScene from "./games/taps/index.js";
import DinoScene from "./games/dino/index.js";
import CatchScene from "./games/catch/index.js";
import WebApp from "@twa-dev/sdk";

WebApp.ready();
WebApp.expand();
WebApp.setHeaderColor("#1a237e");
WebApp.enableClosingConfirmation();
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
	scene: [MenuScene, FlappyScene, TapsScene, DinoScene, CatchScene],
});

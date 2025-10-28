export const HOCKEY_CONFIG = {
	// Player settings
	PADDLE_WIDTH: 200,
	PADDLE_HEIGHT: 30,
	PADDLE_COLOR_BOTTOM: 0x00ff00, // Green for bottom player
	PADDLE_COLOR_TOP: 0xff0000, // Red for top player
	PADDLE_START_Y_BOTTOM: 520,
	PADDLE_START_Y_TOP: 100,

	// Puck settings
	PUCK_SIZE: 20,
	PUCK_COLOR: 0xffffff,
	PUCK_START_X: 200,
	PUCK_START_Y: 300,
	PUCK_INITIAL_SPEED: 250,

	// Game settings
	MAX_SCORE: 3, // Best of 5 means first to 3 wins
	RESET_DELAY: 1000, // ms

	// Depths
	PADDLE_DEPTH: 15,
	PUCK_DEPTH: 15,
	UI_DEPTH: 20,
	CENTER_LINE_DEPTH: 5,

	// Sprite selection
	SPRITES: ["Cherry_1", "Cherry_2"],
	SPRITE_SPACING: 180,
	SPRITE_BOX_SIZE: 140,
};

// Phaser game configuration for React wrapper
import HockeyScene from "./HockeyScene.js";

export default {
	scale: {
		mode: "FIT",
		autoCenter: "CENTER_BOTH",
		width: 400,
		height: 600,
	},
	parent: "game-container",
	backgroundColor: 0x0a1929,
	physics: {
		default: "arcade",
		arcade: {
			gravity: { y: 0 },
			debug: false,
			fps: 60,
			maxVelocity: 500,
			checkCollision: {
				up: true,
				down: true,
				left: true,
				right: true,
			},
		},
	},
	scene: [HockeyScene],
};

export const TAPS_CONFIG = {
	GRID_COLS: 4,
	TILE_WIDTH: 95,
	TILE_HEIGHT: 90,
	ACTIVE_ROW: 4,
	GROUND_WIDTH: 380,
	TIMER_DURATION: 30,

	GROUND_Y_OFFSET: 5,
	START_Y: 110,

	SPRITES: ["Cherry_1", "Cherry_2"],
	SPRITE_SPACING: 180,

	GROUND_COLOR: 0xffff00,
	TILE_COLOR: 0xff0000,
	CORRECT_COLOR: 0x00ff00,

	GROUND_DEPTH: 5,
	UI_DEPTH: 20,
	EFFECTS_DEPTH: 25,
};

// Phaser game configuration for React wrapper
import TapsScene from "./TapsScene.js";

export default {
	scale: {
		mode: "FIT",
		autoCenter: "CENTER_BOTH",
		width: 400,
		height: 600,
	},
	parent: "game-container",
	backgroundColor: 0xffff00,
	physics: {
		default: "arcade",
		arcade: {
			gravity: { y: 0 },
			debug: false,
		},
	},
	scene: [TapsScene],
};

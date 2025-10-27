export const DINO_CONFIG = {
	// Dino settings
	DINO_START_X: 100,
	DINO_START_Y: 500,
	DINO_SCALE: 0.4,
	DINO_COLLISION_WIDTH: 36,
	DINO_COLLISION_HEIGHT: 40,
	GRAVITY: 1400,
	JUMP_VELOCITY: -850,

	// Ground settings
	GROUND_Y: 540,
	GROUND_HEIGHT: 20,
	GROUND_COLOR: 0x3a3a3a,

	// Obstacle settings
	OBSTACLE_MIN_WIDTH: 30,
	OBSTACLE_MAX_WIDTH: 40,
	OBSTACLE_MIN_HEIGHT: 40,
	OBSTACLE_MAX_HEIGHT: 60,
	OBSTACLE_SPAWN_DELAY: 2000,
	OBSTACLE_SPEED: -200,
	OBSTACLE_SPAWN_X: 450,
	OBSTACLE_COLOR: 0x999999,

	// Sky settings
	SKY_COLOR: 0x2a2a2a,

	// Depths
	GROUND_DEPTH: 10,
	DINO_DEPTH: 5,
	COLLISION_DEPTH: 1,
	OBSTACLE_DEPTH: 3,
	UI_DEPTH: 20,

	// Sprite selection
	SPRITES: ["Cherry_1", "Cherry_2"],
	SPRITE_SPACING: 180,
	SPRITE_BOX_SIZE: 140,
};

// Phaser game configuration for React wrapper
import DinoScene from "./DinoScene.js";

export default {
	scale: {
		mode: "FIT",
		autoCenter: "CENTER_BOTH",
		width: 400,
		height: 600,
	},
	parent: "game-container",
	backgroundColor: 0x2a2a2a,
	physics: {
		default: "arcade",
		arcade: {
			gravity: { y: 1600 },
			debug: false,
		},
	},
	scene: [DinoScene],
};

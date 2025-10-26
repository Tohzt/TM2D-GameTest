// Game configuration constants
export const FLAPPY_CONFIG = {
	// Bird settings
	BIRD_START_X: 100,
	BIRD_START_Y: 250,
	BIRD_SCALE: 0.4,
	BIRD_COLLISION_RADIUS: 18,
	GRAVITY: 1000,
	FLAP_VELOCITY: -350,

	// Pipe settings
	PIPE_WIDTH: 60,
	PIPE_HEIGHT: 500,
	PIPE_SPAWN_X: 450,
	PIPE_SPEED: -100,
	PIPE_SPAWN_DELAY: 2000,
	PIPE_GAP: 120,
	PIPE_GAP_MIN: 150,
	PIPE_GAP_MAX: 450,

	// Colors
	GROUND_COLOR: 0x8b4513,
	PIPE_COLOR: 0x00ff00,
	PIPE_BORDER_COLOR: 0x00aa00,

	// Depths
	GROUND_DEPTH: 10,
	BIRD_DEPTH: 5,
	COLLISION_DEPTH: 1,
	UI_DEPTH: 20,

	// Sprite selection
	SPRITES: ["Cherry_1", "Cherry_2"],
	SPRITE_SPACING: 180,
	SPRITE_BOX_SIZE: 140,
};

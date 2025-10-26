// Game configuration constants
export const TAPS_CONFIG = {
	GRID_COLS: 4,
	TILE_WIDTH: 90,
	TILE_HEIGHT: 100,
	ACTIVE_ROW: 3, // 4th row from top (2nd from bottom)
	GROUND_WIDTH: 360,
	TIMER_DURATION: 30, // seconds

	// Positions
	GROUND_Y_OFFSET: 4, // rows from top
	START_Y: 100,

	// Sprite selection
	SPRITES: ["Cherry_1", "Cherry_2"],
	SPRITE_SPACING: 180,

	// Colors
	GROUND_COLOR: 0xffff00,
	TILE_COLOR: 0xff0000,
	CORRECT_COLOR: 0x00ff00,

	// Depths
	GROUND_DEPTH: 5,
	UI_DEPTH: 20,
	EFFECTS_DEPTH: 25,
};

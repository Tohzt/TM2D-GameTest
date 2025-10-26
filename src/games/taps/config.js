// Game configuration constants
export const TAPS_CONFIG = {
	GRID_COLS: 4,
	TILE_WIDTH: 95,
	TILE_HEIGHT: 90,
	ACTIVE_ROW: 4, // 5th row from top (bottom row)
	GROUND_WIDTH: 380,
	TIMER_DURATION: 30, // seconds

	// Positions
	GROUND_Y_OFFSET: 5, // rows from top
	START_Y: 110, // Move rows up to show 5 rows

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

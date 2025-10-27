export const FROGGER_CONFIG = {
	// Frog settings
	FROG_START_X: 200,
	FROG_START_Y: 550,
	FROG_SCALE: 0.4,
	FROG_COLLISION_WIDTH: 30,
	FROG_COLLISION_HEIGHT: 30,
	GRID_SIZE: 50, // Size of each grid cell for movement

	// World settings
	WORLD_WIDTH: 400,
	WORLD_HEIGHT: 600,

	// Background colors (different zones)
	START_ZONE_COLOR: 0x228b22, // Dark green
	ROAD_COLOR: 0x4a4a4a, // Dark gray
	SAFE_ZONE_COLOR: 0x228b22, // Green
	WATER_COLOR: 0x4169e1, // Royal blue
	FINISH_ZONE_COLOR: 0x228b22, // Dark green

	// Ground/Road
	GROUND_COLOR: 0x228b22,

	// Vehicle settings
	VEHICLE_COLOR: 0xff6600, // Orange

	// Depths
	BACKGROUND_DEPTH: 0,
	GROUND_DEPTH: 10,
	VEHICLE_DEPTH: 12,
	FROG_DEPTH: 15,
	COLLISION_DEPTH: 1,
	UI_DEPTH: 20,

	// Sprite selection
	SPRITES: ["Cherry_1", "Cherry_2"],
	SPRITE_SPACING: 180,
	SPRITE_BOX_SIZE: 140,
};

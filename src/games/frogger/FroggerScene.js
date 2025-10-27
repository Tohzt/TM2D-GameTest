import Phaser from "phaser";
import { FROGGER_CONFIG } from "./config.js";
import { SpriteSelector } from "../components/SpriteSelector.js";
import { UIManager } from "./UIManager.js";
import { VehicleManager } from "./VehicleManager.js";

export class FroggerScene extends Phaser.Scene {
	constructor() {
		super({ key: "FroggerScene" });
	}

	preload() {
		FROGGER_CONFIG.SPRITES.forEach((sprite) => {
			this.load.image(sprite, `/assets/stickers/${sprite}.png`);
		});
	}

	create() {
		this.spriteSelector = new SpriteSelector(this, {
			sprites: FROGGER_CONFIG.SPRITES,
			spriteSpacing: FROGGER_CONFIG.SPRITE_SPACING,
			spriteBoxSize: FROGGER_CONFIG.SPRITE_BOX_SIZE,
			titleY: 100,
			spriteY: 250,
			gameName: "Frogger",
		});
		this.uiManager = new UIManager(this);
		this.vehicleManager = new VehicleManager(this);

		this.spriteSelector.showSelectionScreen(
			(spriteKey) => {
				this.selectedSprite = spriteKey;
				this.initializeGame();
			},
			() => {
				this.scene.start("MenuScene");
			}
		);

		this.createBackground();
		this.score = 0;
		this.gameOver = false;
		this.gameStarted = false;
		this.selectedSprite = null;
	}

	createBackground() {
		// Create green background
		this.add.rectangle(200, 300, 400, 600, FROGGER_CONFIG.START_ZONE_COLOR);

		// Create road lanes (gray rectangles) - aligned to grid
		const gridSize = FROGGER_CONFIG.GRID_SIZE; // 50 pixels
		const laneHeight = gridSize; // Each lane is one grid cell tall

		// Align roads to grid: start at y=300 (which is 6 grid cells down from top)
		const roadStartY = 300; // Align to grid: 300 / 50 = 6
		const totalLanesHeight = 4 * laneHeight; // 200 pixels (4 grid cells)

		// Create one big gray road area aligned to grid
		const roadArea = this.add.rectangle(
			200,
			roadStartY + totalLanesHeight / 2,
			400,
			totalLanesHeight,
			FROGGER_CONFIG.ROAD_COLOR
		);
		roadArea.setDepth(FROGGER_CONFIG.GROUND_DEPTH);

		// Add white divider lines between lanes, aligned to grid
		for (let i = 1; i < 4; i++) {
			const lineY = roadStartY + i * laneHeight;
			const dividerLine = this.add.rectangle(200, lineY, 400, 2, 0xffffff);
			dividerLine.setDepth(FROGGER_CONFIG.GROUND_DEPTH + 1);
		}

		// Create safe start zone at bottom
		this.ground = this.add.rectangle(
			200,
			550,
			400,
			100,
			FROGGER_CONFIG.START_ZONE_COLOR
		);
		this.ground.setDepth(FROGGER_CONFIG.GROUND_DEPTH);

		// Create finish zone at top
		this.finishZone = this.add.rectangle(
			200,
			50,
			400,
			100,
			FROGGER_CONFIG.FINISH_ZONE_COLOR
		);
		this.finishZone.setDepth(FROGGER_CONFIG.GROUND_DEPTH);

		// DEBUG: Add grid overlay for testing
		this.drawGrid();
	}

	drawGrid() {
		const gridSize = FROGGER_CONFIG.GRID_SIZE;
		const worldWidth = FROGGER_CONFIG.WORLD_WIDTH;
		const worldHeight = FROGGER_CONFIG.WORLD_HEIGHT;

		// Create a graphics object for the grid
		const gridGraphics = this.add.graphics();
		gridGraphics.setDepth(FROGGER_CONFIG.GROUND_DEPTH + 2);
		gridGraphics.lineStyle(1, 0xffffff, 0.3);

		// Draw vertical lines
		for (let x = 0; x <= worldWidth; x += gridSize) {
			gridGraphics.moveTo(x, 0);
			gridGraphics.lineTo(x, worldHeight);
		}

		// Draw horizontal lines
		for (let y = 0; y <= worldHeight; y += gridSize) {
			gridGraphics.moveTo(0, y);
			gridGraphics.lineTo(worldWidth, y);
		}

		gridGraphics.strokePath();
	}

	initializeGame() {
		this.spriteSelector.clearSelectionScreen();

		// Create frog sprite - centered in grid cell
		// Grid cells are 50px, so center is at 25px offset
		const gridOffsetX = FROGGER_CONFIG.GRID_SIZE / 2;
		const gridOffsetY = FROGGER_CONFIG.GRID_SIZE / 2;

		this.frog = this.add.image(
			FROGGER_CONFIG.FROG_START_X + gridOffsetX,
			FROGGER_CONFIG.FROG_START_Y + gridOffsetY,
			this.selectedSprite
		);
		this.frog.setScale(FROGGER_CONFIG.FROG_SCALE);
		this.frog.setDepth(FROGGER_CONFIG.FROG_DEPTH);

		// Create collision box for frog
		this.frogCollision = this.add.rectangle(
			FROGGER_CONFIG.FROG_START_X + gridOffsetX,
			FROGGER_CONFIG.FROG_START_Y + gridOffsetY,
			FROGGER_CONFIG.FROG_COLLISION_WIDTH,
			FROGGER_CONFIG.FROG_COLLISION_HEIGHT,
			0x000000,
			0
		);

		// DEBUG: Add visible border around player sprite
		this.frogBorder = this.add.rectangle(
			FROGGER_CONFIG.FROG_START_X + gridOffsetX,
			FROGGER_CONFIG.FROG_START_Y + gridOffsetY,
			FROGGER_CONFIG.FROG_COLLISION_WIDTH,
			FROGGER_CONFIG.FROG_COLLISION_HEIGHT,
			0x000000,
			0
		);
		this.frogBorder.setStrokeStyle(2, 0xff00ff); // Magenta border
		this.frogBorder.setDepth(FROGGER_CONFIG.FROG_DEPTH - 1);
		this.physics.add.existing(this.frogCollision);
		this.frogCollision.body.allowGravity = false;
		this.frogCollision.body.setSize(
			FROGGER_CONFIG.FROG_COLLISION_WIDTH,
			FROGGER_CONFIG.FROG_COLLISION_HEIGHT
		);
		this.frogCollision.setDepth(FROGGER_CONFIG.COLLISION_DEPTH);

		// Store frog's grid position
		this.frogGridX = Math.floor(
			FROGGER_CONFIG.FROG_START_X / FROGGER_CONFIG.GRID_SIZE
		);
		this.frogGridY = Math.floor(
			FROGGER_CONFIG.FROG_START_Y / FROGGER_CONFIG.GRID_SIZE
		);

		this.uiManager.createGameUI();

		// Start vehicle spawning
		this.vehicleManager.startSpawning();

		// Set up collision detection
		this.vehicleCollider = this.physics.add.overlap(
			this.frogCollision,
			this.vehicleManager.vehicles,
			this.hitVehicle,
			null,
			this
		);

		// Set up input for directional movement
		this.input.on("pointerdown", this.handlePointerDown, this);
	}

	hitVehicle() {
		if (this.gameOver || !this.gameStarted) return;
		this.hitObstacle();
	}

	handlePointerDown(pointer) {
		if (this.gameOver) {
			return;
		}

		if (!this.gameStarted) {
			this.startGame();
			return;
		}

		// Calculate direction based on pointer position relative to frog
		const frogX = this.frog.x;
		const frogY = this.frog.y;
		const deltaX = pointer.x - frogX;
		const deltaY = pointer.y - frogY;

		// Determine which direction has greater magnitude
		if (Math.abs(deltaX) > Math.abs(deltaY)) {
			// Horizontal movement
			if (deltaX > 0) {
				this.moveRight();
			} else {
				this.moveLeft();
			}
		} else {
			// Vertical movement
			if (deltaY > 0) {
				this.moveDown();
			} else {
				this.moveUp();
			}
		}
	}

	startGame() {
		this.gameStarted = true;
		this.uiManager.hideStartText();
	}

	moveLeft() {
		if (this.gameOver || !this.gameStarted) return;

		const newX = this.frog.x - FROGGER_CONFIG.GRID_SIZE;
		if (newX >= FROGGER_CONFIG.GRID_SIZE / 2) {
			// Allow half grid for centering
			this.frog.x = newX;
			this.frogCollision.x = newX;
			if (this.frogBorder) this.frogBorder.x = newX;
			this.frogGridX--;
		}
	}

	moveRight() {
		if (this.gameOver || !this.gameStarted) return;

		const newX = this.frog.x + FROGGER_CONFIG.GRID_SIZE;
		if (newX <= FROGGER_CONFIG.WORLD_WIDTH - FROGGER_CONFIG.GRID_SIZE / 2) {
			// Allow half grid for centering
			this.frog.x = newX;
			this.frogCollision.x = newX;
			if (this.frogBorder) this.frogBorder.x = newX;
			this.frogGridX++;
		}
	}

	moveUp() {
		if (this.gameOver || !this.gameStarted) return;

		const newY = this.frog.y - FROGGER_CONFIG.GRID_SIZE;
		if (newY >= FROGGER_CONFIG.GRID_SIZE / 2) {
			// Allow half grid for centering
			this.frog.y = newY;
			this.frogCollision.y = newY;
			if (this.frogBorder) this.frogBorder.y = newY;
			this.frogGridY--;
		}
	}

	moveDown() {
		if (this.gameOver || !this.gameStarted) return;

		const newY = this.frog.y + FROGGER_CONFIG.GRID_SIZE;
		if (newY <= FROGGER_CONFIG.WORLD_HEIGHT - FROGGER_CONFIG.GRID_SIZE / 2) {
			// Allow half grid for centering
			this.frog.y = newY;
			this.frogCollision.y = newY;
			if (this.frogBorder) this.frogBorder.y = newY;
			this.frogGridY++;
		}
	}

	update() {
		if (this.gameOver || !this.gameStarted) {
			return;
		}

		// Update vehicles
		if (this.vehicleManager) {
			this.vehicleManager.update(this.frogCollision);
		}
	}

	hitObstacle() {
		if (this.gameOver) return;

		this.gameOver = true;
		this.frog.setTint(0xff0000);

		const { retryText, quitText } = this.uiManager.showGameOver(this.score);

		retryText.on("pointerdown", () => {
			this.restartGame();
		});

		quitText.on("pointerdown", () => {
			this.scene.start("MenuScene");
		});
	}

	restartGame() {
		this.uiManager.clearEndGameUI();

		this.gameOver = false;
		this.gameStarted = false;
		this.score = 0;
		this.uiManager.resetScore();

		this.frog.clearTint();

		// Reset to centered position in grid cell
		const gridOffsetX = FROGGER_CONFIG.GRID_SIZE / 2;
		const gridOffsetY = FROGGER_CONFIG.GRID_SIZE / 2;

		this.frog.x = FROGGER_CONFIG.FROG_START_X + gridOffsetX;
		this.frog.y = FROGGER_CONFIG.FROG_START_Y + gridOffsetY;

		this.frogCollision.x = FROGGER_CONFIG.FROG_START_X + gridOffsetX;
		this.frogCollision.y = FROGGER_CONFIG.FROG_START_Y + gridOffsetY;

		if (this.frogBorder) {
			this.frogBorder.x = FROGGER_CONFIG.FROG_START_X + gridOffsetX;
			this.frogBorder.y = FROGGER_CONFIG.FROG_START_Y + gridOffsetY;
		}

		this.frogGridX = Math.floor(
			FROGGER_CONFIG.FROG_START_X / FROGGER_CONFIG.GRID_SIZE
		);
		this.frogGridY = Math.floor(
			FROGGER_CONFIG.FROG_START_Y / FROGGER_CONFIG.GRID_SIZE
		);

		// Destroy and recreate vehicle manager
		if (this.vehicleManager) {
			this.vehicleManager.destroy();
		}
		if (this.vehicleCollider) {
			this.vehicleCollider.destroy();
		}

		this.vehicleManager = new VehicleManager(this);
		this.vehicleManager.startSpawning();

		// Recreate collision detection
		this.vehicleCollider = this.physics.add.overlap(
			this.frogCollision,
			this.vehicleManager.vehicles,
			this.hitVehicle,
			null,
			this
		);
	}
}

export default FroggerScene;

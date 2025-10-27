import Phaser from "phaser";
import { FROGGER_CONFIG } from "./config.js";
import { SpriteSelector } from "../components/SpriteSelector.js";
import { UIManager } from "./UIManager.js";
import { VehicleManager } from "./VehicleManager.js";
import { LogManager } from "./LogManager.js";

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
		this.logManager = new LogManager(this);

		this.spriteSelector.showSelectionScreen((spriteKey) => {
			this.selectedSprite = spriteKey;
			this.initializeGame();
		});

		this.createBackground();
		this.score = 0;
		this.gameOver = false;
		this.gameStarted = false;
		this.selectedSprite = null;
		this.countdownActive = false;
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

		// Create finish zone at top
		this.finishZone = this.add.rectangle(
			200,
			25,
			400,
			50,
			FROGGER_CONFIG.FINISH_ZONE_COLOR
		);
		this.finishZone.setDepth(FROGGER_CONFIG.GROUND_DEPTH);

		// Create water area (4 rows of blue)
		const waterStartY = 50; // Start right after finish zone
		const waterHeight = 4 * laneHeight; // 4 lanes of water (200 pixels)

		const waterArea = this.add.rectangle(
			200,
			waterStartY + waterHeight / 2,
			400,
			waterHeight,
			FROGGER_CONFIG.WATER_COLOR
		);
		waterArea.setDepth(FROGGER_CONFIG.GROUND_DEPTH);

		// Store water area bounds for collision detection
		this.waterTop = waterStartY;
		this.waterBottom = waterStartY + waterHeight;

		// Create one row of grass after water, before roads
		const grassStartY = 250; // After water ends at y=250
		const grassArea = this.add.rectangle(
			200,
			grassStartY + laneHeight / 2,
			400,
			laneHeight,
			FROGGER_CONFIG.SAFE_ZONE_COLOR
		);
		grassArea.setDepth(FROGGER_CONFIG.GROUND_DEPTH);

		// Create safe start zone at bottom
		this.ground = this.add.rectangle(
			200,
			550,
			400,
			100,
			FROGGER_CONFIG.START_ZONE_COLOR
		);
		this.ground.setDepth(FROGGER_CONFIG.GROUND_DEPTH);

		// Grid overlay disabled for cleaner gameplay
		// this.drawGrid();
	}

	drawGrid() {
		// Grid overlay disabled
		/*
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
		*/
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

		// Start log spawning
		this.logManager.startSpawning();

		// Set up collision detection
		this.vehicleCollider = this.physics.add.overlap(
			this.frogCollision,
			this.vehicleManager.vehicles,
			this.hitVehicle,
			null,
			this
		);

		// Set up log collision detection
		this.logCollider = this.physics.add.overlap(
			this.frogCollision,
			this.logManager.logs,
			this.onLogCollision,
			null,
			this
		);

		// Set up input for directional movement
		this.input.on("pointerdown", this.handlePointerDown, this);

		// Track if frog is riding a log
		this.frog.ridingLog = null;
	}

	onLogCollision() {
		// Frog landed on a log - check which log
		const frogBounds = this.frogCollision.getBounds();

		this.logManager.logs.children.entries.forEach((log) => {
			if (!log || !log.active) return;

			const logBounds = log.getBounds();

			// Check if frog is overlapping with the log
			if (Phaser.Geom.Rectangle.Intersection(frogBounds, logBounds)) {
				// Check if frog center is on the log (not hanging off edges)
				const overlap = Phaser.Geom.Rectangle.Intersection(
					frogBounds,
					logBounds
				);
				// If there's ANY meaningful overlap, frog is on the log
				if (overlap && overlap.width > frogBounds.width * 0.15) {
					// Frog is riding this log
					this.frog.ridingLog = log;
					return;
				}
			}
		});
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

		// Allow jumping off logs by clearing riding state when attempting to move
		if (this.frog.ridingLog) {
			// User wants to jump off - clear the riding state
			this.frog.ridingLog = null;
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

		// Start 3 second countdown before allowing player movement
		this.startCountdown();
	}

	startCountdown() {
		let countdown = 3;
		this.countdownActive = true; // Disable movement during countdown

		const countdownText = this.add.text(200, 300, "3", {
			fontSize: "72px",
			fill: "#ffff00",
			fontFamily: "Arial",
			fontStyle: "bold",
		});
		countdownText.setOrigin(0.5);
		countdownText.setDepth(FROGGER_CONFIG.UI_DEPTH);

		// Disable input during countdown
		this.input.on("pointerdown", () => {
			// Block all input during countdown
		});

		// Countdown animation
		const countdownEvent = this.time.addEvent({
			delay: 1000, // 1 second intervals
			callback: () => {
				countdown--;

				if (countdown > 0) {
					countdownText.setText(countdown.toString());
					// Add scale animation
					countdownText.setScale(1.2);
					this.tweens.add({
						targets: countdownText,
						scale: 1,
						duration: 200,
					});
				} else {
					// Countdown complete - show "GO!"
					countdownText.setText("GO!");
					countdownText.setTint(0x00ff00); // Use setTint instead of setFill
					this.tweens.add({
						targets: countdownText,
						alpha: 0,
						scale: 2,
						duration: 500,
						onComplete: () => {
							countdownText.destroy();
							// Re-enable input and allow movement
							this.countdownActive = false;
							this.input.off("pointerdown");
							this.input.on("pointerdown", this.handlePointerDown, this);
						},
					});
				}
			},
			repeat: 3,
		});
	}

	moveLeft() {
		if (
			this.gameOver ||
			!this.gameStarted ||
			this.frog.ridingLog ||
			this.countdownActive
		)
			return;

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
		if (
			this.gameOver ||
			!this.gameStarted ||
			this.frog.ridingLog ||
			this.countdownActive
		)
			return;

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
		if (
			this.gameOver ||
			!this.gameStarted ||
			this.frog.ridingLog ||
			this.countdownActive
		)
			return;

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
		if (
			this.gameOver ||
			!this.gameStarted ||
			this.frog.ridingLog ||
			this.countdownActive
		)
			return;

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

		// Check for win condition
		this.checkWin();

		// Update vehicles
		if (this.vehicleManager) {
			this.vehicleManager.update(this.frogCollision);
		}

		// Update logs and handle frog riding
		if (this.logManager) {
			this.logManager.update(this.frog, this.frogCollision, this.frogBorder);
		}

		// Check if frog is in water (and not on a log)
		this.checkWaterCollision();
	}

	checkWin() {
		const frogY = this.frog.y;

		// Check if frog reached the finish zone (top area, y=0 to y=50)
		if (frogY >= 0 && frogY <= 50) {
			// Frog reached the finish! Win!
			this.winGame();
		}
	}

	winGame() {
		if (this.gameOver || !this.gameStarted) return;

		this.gameOver = true;
		this.score += 10; // Award points for completing
		this.uiManager.updateScore(this.score);

		// Pause the game
		this.physics.pause();

		const { retryText } = this.uiManager.showWin(this.score);

		retryText.on("pointerdown", () => {
			this.restartGame();
		});
	}

	checkWaterCollision() {
		const frogY = this.frog.y;

		// Check if frog is in the water zone (y=50 to y=250)
		if (frogY >= this.waterTop && frogY <= this.waterBottom) {
			// Check if currently riding a log or overlapping with any log
			let isOnLog = false;

			if (this.frog.ridingLog && this.frog.ridingLog.active) {
				isOnLog = true;
			} else {
				// Do a quick check for overlap with any log in the current frame
				const frogBounds = this.frogCollision.getBounds();
				this.logManager.logs.children.entries.forEach((log) => {
					if (!log || !log.active) return;

					const logBounds = log.getBounds();
					const overlap = Phaser.Geom.Rectangle.Intersection(
						frogBounds,
						logBounds
					);

					// Very forgiving - even 20% overlap counts as "on the log"
					if (overlap && overlap.width > frogBounds.width * 0.2) {
						isOnLog = true;
						// Set riding log for this frame
						this.frog.ridingLog = log;
					}
				});
			}

			if (!isOnLog) {
				// Frog is in water and not on any log - game over!
				this.hitObstacle();
			}
		} else {
			// Not in water anymore, clear riding state
			this.frog.ridingLog = null;
		}
	}

	hitObstacle() {
		if (this.gameOver) return;

		this.gameOver = true;
		this.frog.setTint(0xff0000);

		const { retryText } = this.uiManager.showGameOver(this.score);

		retryText.on("pointerdown", () => {
			this.restartGame();
		});
	}

	restartGame() {
		this.uiManager.clearEndGameUI();

		this.gameOver = false;
		this.gameStarted = true; // Keep as started since we're restarting
		this.score = 0;
		this.uiManager.resetScore();

		this.frog.clearTint();

		// Reset to centered position in grid cell
		const gridOffsetX = FROGGER_CONFIG.GRID_SIZE / 2;
		const gridOffsetY = FROGGER_CONFIG.GRID_SIZE / 2;

		this.frog.x = FROGGER_CONFIG.FROG_START_X + gridOffsetX;
		this.frog.y = FROGGER_CONFIG.FROG_START_Y + gridOffsetY;
		this.frog.ridingLog = null; // Clear riding state

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
		if (this.logManager) {
			this.logManager.destroy();
		}
		if (this.vehicleCollider) {
			this.vehicleCollider.destroy();
		}
		if (this.logCollider) {
			this.logCollider.destroy();
		}

		this.vehicleManager = new VehicleManager(this);
		this.logManager = new LogManager(this);

		// Recreate collision detection first
		this.vehicleCollider = this.physics.add.overlap(
			this.frogCollision,
			this.vehicleManager.vehicles,
			this.hitVehicle,
			null,
			this
		);

		this.logCollider = this.physics.add.overlap(
			this.frogCollision,
			this.logManager.logs,
			this.onLogCollision,
			null,
			this
		);

		// Start spawning and countdown
		this.vehicleManager.startSpawning();
		this.logManager.startSpawning();

		// Reset riding state
		this.frog.ridingLog = null;

		// Reset countdown flag and start countdown
		this.countdownActive = false;
		this.startCountdown();

		// Resume physics
		this.physics.resume();
	}
}

export default FroggerScene;

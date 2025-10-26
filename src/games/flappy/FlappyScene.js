import Phaser from "phaser";
import { FLAPPY_CONFIG } from "./config.js";
import { SpriteSelector } from "../components/SpriteSelector.js";
import { UIManager } from "./UIManager.js";
import { PipeManager } from "./PipeManager.js";

export class FlappyScene extends Phaser.Scene {
	constructor() {
		super({ key: "FlappyScene" });
	}

	preload() {
		// Load all sprite images from the stickers directory
		FLAPPY_CONFIG.SPRITES.forEach((sprite) => {
			this.load.image(sprite, `/assets/stickers/${sprite}.png`);
		});
	}

	create() {
		// Initialize managers
		this.spriteSelector = new SpriteSelector(this, {
			sprites: FLAPPY_CONFIG.SPRITES,
			spriteSpacing: FLAPPY_CONFIG.SPRITE_SPACING,
			spriteBoxSize: FLAPPY_CONFIG.SPRITE_BOX_SIZE,
			titleY: 100,
			spriteY: 250,
			gameName: "Flappy Bird",
		});
		this.uiManager = new UIManager(this);
		this.pipeManager = new PipeManager(this);

		// Show sprite selection screen
		this.spriteSelector.showSelectionScreen(
			(spriteKey) => {
				this.selectedSprite = spriteKey;
				this.initializeGame();
			},
			() => {
				// Back button - return to menu
				this.scene.start("MenuScene");
			}
		);

		// Create ground
		this.createGround();

		// Game state
		this.score = 0;
		this.gameOver = false;
		this.gameStarted = false;
		this.selectedSprite = null;
	}

	createGround() {
		this.ground = this.add.rectangle(
			200,
			580,
			400,
			40,
			FLAPPY_CONFIG.GROUND_COLOR
		);
		this.physics.add.existing(this.ground, true);
		this.ground.setDepth(FLAPPY_CONFIG.GROUND_DEPTH);
	}

	initializeGame() {
		// Clear sprite selection
		this.spriteSelector.clearSelectionScreen();

		// Create bird with selected sprite (visual only, no physics)
		this.bird = this.add.image(
			FLAPPY_CONFIG.BIRD_START_X,
			FLAPPY_CONFIG.BIRD_START_Y,
			this.selectedSprite
		);
		this.bird.setScale(FLAPPY_CONFIG.BIRD_SCALE);
		this.bird.setDepth(FLAPPY_CONFIG.BIRD_DEPTH);

		// Create invisible circular collision area
		this.birdCollision = this.add.circle(
			FLAPPY_CONFIG.BIRD_START_X,
			FLAPPY_CONFIG.BIRD_START_Y,
			FLAPPY_CONFIG.BIRD_COLLISION_RADIUS,
			0x000000,
			0
		);
		this.physics.add.existing(this.birdCollision);
		this.birdCollision.body.setCollideWorldBounds(true);
		this.birdCollision.body.setGravityY(0);
		this.birdCollision.setDepth(FLAPPY_CONFIG.COLLISION_DEPTH);

		// Create UI
		this.uiManager.createGameUI();

		// Input handling - tap/click anywhere to start/flap
		this.input.on("pointerdown", this.startOrFlap, this);

		// Check collisions using the collision circle
		this.groundCollider = this.physics.add.collider(
			this.birdCollision,
			this.ground,
			this.hitObstacle,
			null,
			this
		);
		this.pipeCollider = this.physics.add.overlap(
			this.birdCollision,
			this.pipeManager.pipes,
			this.hitObstacle,
			null,
			this
		);
	}

	update() {
		if (this.gameOver || !this.gameStarted) {
			return;
		}

		// Sync bird sprite with collision circle position
		this.bird.x = this.birdCollision.x;
		this.bird.y = this.birdCollision.y;

		// Check if bird fell below screen
		if (this.birdCollision.y > 600) {
			this.hitObstacle();
		}

		// Rotate bird based on velocity
		const angle = Phaser.Math.Clamp(
			this.birdCollision.body.velocity.y * 0.1,
			-30,
			90
		);
		this.bird.angle = angle;

		// Check for scoring
		const scored = this.pipeManager.update(this.bird);
		if (scored) {
			this.score += 1;
			this.uiManager.updateScore(this.score);
		}
	}

	startOrFlap() {
		if (this.gameOver) {
			// Don't handle restart here anymore, let the buttons handle it
			return;
		}

		if (!this.gameStarted) {
			this.startGame();
			return;
		}

		this.flap();
	}

	startGame() {
		this.gameStarted = true;
		this.birdCollision.body.setGravityY(FLAPPY_CONFIG.GRAVITY);
		this.uiManager.hideStartText();

		// Start spawning pipes
		this.pipeManager.startSpawning(this);

		this.flap(); // Initial flap
	}

	flap() {
		if (!this.gameStarted) return;

		this.birdCollision.body.setVelocityY(FLAPPY_CONFIG.FLAP_VELOCITY);
	}

	hitObstacle() {
		if (this.gameOver) return;

		this.gameOver = true;
		this.physics.pause();
		this.bird.setTint(0xff0000); // Red tint for game over effect

		const { retryText, quitText } = this.uiManager.showGameOver(this.score);

		retryText.on("pointerdown", () => {
			this.restartGame();
		});

		quitText.on("pointerdown", () => {
			this.scene.start("MenuScene");
		});
	}

	restartGame() {
		// Clean up end game UI
		this.uiManager.clearEndGameUI();

		// Reset game state
		this.gameOver = false;
		this.gameStarted = false;
		this.score = 0;
		this.uiManager.resetScore();

		// Reset bird visual and physics
		this.bird.clearTint();
		this.bird.x = FLAPPY_CONFIG.BIRD_START_X;
		this.bird.y = FLAPPY_CONFIG.BIRD_START_Y;
		this.bird.angle = 0;

		this.birdCollision.x = FLAPPY_CONFIG.BIRD_START_X;
		this.birdCollision.y = FLAPPY_CONFIG.BIRD_START_Y;
		this.birdCollision.body.setVelocity(0, 0);
		this.birdCollision.body.setGravityY(0);

		// Remove old colliders
		if (this.pipeCollider) {
			this.pipeCollider.destroy();
		}

		// Stop pipe spawning and clean up
		if (this.pipeManager) {
			this.pipeManager.destroy();
		}

		// Create new pipe manager
		this.pipeManager = new PipeManager(this);

		// Re-add pipe collision
		this.pipeCollider = this.physics.add.overlap(
			this.birdCollision,
			this.pipeManager.pipes,
			this.hitObstacle,
			null,
			this
		);

		// Resume physics
		this.physics.resume();
	}
}

export default FlappyScene;

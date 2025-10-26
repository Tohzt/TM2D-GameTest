import Phaser from "phaser";
import { DINO_CONFIG } from "./config.js";
import { SpriteSelector } from "../components/SpriteSelector.js";
import { UIManager } from "./UIManager.js";
import { ObstacleManager } from "./ObstacleManager.js";

export class DinoScene extends Phaser.Scene {
	constructor() {
		super({ key: "DinoScene" });
	}

	preload() {
		DINO_CONFIG.SPRITES.forEach((sprite) => {
			this.load.image(sprite, `/assets/stickers/${sprite}.png`);
		});
	}

	create() {
		// Sky background
		this.add.rectangle(200, 300, 400, 600, DINO_CONFIG.SKY_COLOR);

		this.spriteSelector = new SpriteSelector(this, {
			sprites: DINO_CONFIG.SPRITES,
			spriteSpacing: DINO_CONFIG.SPRITE_SPACING,
			spriteBoxSize: DINO_CONFIG.SPRITE_BOX_SIZE,
			titleY: 100,
			spriteY: 250,
			gameName: "Dino Runner",
		});
		this.uiManager = new UIManager(this);
		this.obstacleManager = new ObstacleManager(this);

		this.spriteSelector.showSelectionScreen(
			(spriteKey) => {
				this.selectedSprite = spriteKey;
				this.initializeGame();
			},
			() => {
				this.scene.start("MenuScene");
			}
		);

		this.createGround();
		this.score = 0;
		this.gameOver = false;
		this.gameStarted = false;
		this.selectedSprite = null;
	}

	createGround() {
		this.ground = this.add.rectangle(
			200,
			DINO_CONFIG.GROUND_Y,
			400,
			DINO_CONFIG.GROUND_HEIGHT,
			DINO_CONFIG.GROUND_COLOR
		);
		this.physics.add.existing(this.ground, true);
		this.ground.setDepth(DINO_CONFIG.GROUND_DEPTH);
	}

	initializeGame() {
		this.spriteSelector.clearSelectionScreen();

		// Create dino sprite
		this.dino = this.add.image(
			DINO_CONFIG.DINO_START_X,
			DINO_CONFIG.DINO_START_Y,
			this.selectedSprite
		);
		this.dino.setScale(DINO_CONFIG.DINO_SCALE);
		this.dino.setDepth(DINO_CONFIG.DINO_DEPTH);

		// Create collision box for dino
		this.dinoCollision = this.add.rectangle(
			DINO_CONFIG.DINO_START_X,
			DINO_CONFIG.DINO_START_Y,
			DINO_CONFIG.DINO_COLLISION_WIDTH,
			DINO_CONFIG.DINO_COLLISION_HEIGHT,
			0x000000,
			0
		);
		this.physics.add.existing(this.dinoCollision);
		this.dinoCollision.body.setCollideWorldBounds(true);
		this.dinoCollision.body.setGravityY(0);
		this.dinoCollision.setDepth(DINO_CONFIG.COLLISION_DEPTH);

		this.uiManager.createGameUI();

		this.input.on("pointerdown", this.startOrJump, this);

		// Ground collision
		this.groundCollider = this.physics.add.collider(
			this.dinoCollision,
			this.ground,
			() => {
				this.isGrounded = true;
			},
			null,
			this
		);

		// Obstacle collision
		this.obstacleCollider = this.physics.add.overlap(
			this.dinoCollision,
			this.obstacleManager.obstacles,
			this.hitObstacle,
			null,
			this
		);

		this.isGrounded = true;
	}

	update() {
		if (this.gameOver || !this.gameStarted) {
			return;
		}

		// Update dino position to match collision box
		this.dino.x = this.dinoCollision.x;
		this.dino.y = this.dinoCollision.y;

		// Check if on ground
		if (
			this.dinoCollision.body.touching.down &&
			this.dinoCollision.body.velocity.y >= 0
		) {
			this.isGrounded = true;
		}

		// Update obstacles and check scoring
		const scored = this.obstacleManager.update(this.dinoCollision);
		if (scored) {
			this.score += 1;
			this.uiManager.updateScore(this.score);
		}
	}

	startOrJump() {
		if (this.gameOver) {
			return;
		}

		if (!this.gameStarted) {
			this.startGame();
			return;
		}

		this.jump();
	}

	startGame() {
		this.gameStarted = true;
		this.dinoCollision.body.setGravityY(DINO_CONFIG.GRAVITY);
		this.uiManager.hideStartText();
		this.obstacleManager.startSpawning(this);
	}

	jump() {
		if (!this.gameStarted || !this.isGrounded) return;

		this.isGrounded = false;
		this.dinoCollision.body.setVelocityY(DINO_CONFIG.JUMP_VELOCITY);
	}

	hitObstacle() {
		if (this.gameOver) return;

		this.gameOver = true;
		this.physics.pause();
		this.dino.setTint(0xff0000);

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

		this.dino.clearTint();
		this.dino.x = DINO_CONFIG.DINO_START_X;
		this.dino.y = DINO_CONFIG.DINO_START_Y;

		this.dinoCollision.x = DINO_CONFIG.DINO_START_X;
		this.dinoCollision.y = DINO_CONFIG.DINO_START_Y;
		this.dinoCollision.body.setVelocity(0, 0);
		this.dinoCollision.body.setGravityY(0);
		this.isGrounded = true;

		if (this.obstacleCollider) {
			this.obstacleCollider.destroy();
		}

		if (this.obstacleManager) {
			this.obstacleManager.destroy();
		}

		this.obstacleManager = new ObstacleManager(this);

		this.obstacleCollider = this.physics.add.overlap(
			this.dinoCollision,
			this.obstacleManager.obstacles,
			this.hitObstacle,
			null,
			this
		);

		this.physics.resume();
	}
}

export default DinoScene;

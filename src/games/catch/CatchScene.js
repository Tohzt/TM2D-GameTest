import Phaser from "phaser";
import { CATCH_CONFIG } from "./config.js";
import { SpriteSelector } from "../components/SpriteSelector.js";
import { UIManager } from "./UIManager.js";
import { SpriteManager } from "./SpriteManager.js";

export class CatchScene extends Phaser.Scene {
	constructor() {
		super({ key: "CatchScene" });
	}

	preload() {
		CATCH_CONFIG.SPRITES.forEach((sprite) => {
			this.load.image(sprite, `/assets/stickers/${sprite}.png`);
		});
	}

	create() {
		// Sky background
		this.add.rectangle(200, 300, 400, 600, CATCH_CONFIG.SKY_COLOR);

		this.spriteSelector = new SpriteSelector(this, {
			sprites: CATCH_CONFIG.SPRITES,
			spriteSpacing: CATCH_CONFIG.SPRITE_SPACING,
			spriteBoxSize: CATCH_CONFIG.SPRITE_BOX_SIZE,
			titleY: 100,
			spriteY: 250,
			gameName: "Catch Game",
		});
		this.uiManager = new UIManager(this);

		this.spriteSelector.showSelectionScreen((spriteKey) => {
			this.selectedSprite = spriteKey;
			this.initializeGame();
		});

		this.createGround();
		this.score = 0;
		this.gameOver = false;
		this.gameStarted = false;
		this.selectedSprite = null;
		this.pointerDown = false;
	}

	createGround() {
		this.ground = this.add.rectangle(
			200,
			CATCH_CONFIG.GROUND_Y,
			400,
			CATCH_CONFIG.GROUND_HEIGHT,
			CATCH_CONFIG.GROUND_COLOR
		);
		this.physics.add.existing(this.ground, true);
		this.ground.setDepth(CATCH_CONFIG.GROUND_DEPTH);
	}

	initializeGame() {
		this.spriteSelector.clearSelectionScreen();

		// Create basket
		this.basket = this.add.rectangle(
			CATCH_CONFIG.BASKET_START_X,
			CATCH_CONFIG.BASKET_START_Y,
			CATCH_CONFIG.BASKET_WIDTH,
			CATCH_CONFIG.BASKET_HEIGHT,
			CATCH_CONFIG.BASKET_COLOR
		);
		this.basket.setDepth(CATCH_CONFIG.BASKET_DEPTH);
		this.basket.setStrokeStyle(2, 0x654321);

		// Create sprite manager
		this.spriteManager = new SpriteManager(this, this.selectedSprite);

		this.uiManager.createGameUI();

		this.input.on("pointerdown", () => {
			if (!this.gameOver && !this.gameStarted) {
				this.startGame();
			}
		});

		// Set up input handling for basket movement
		this.input.on("pointerdown", this.onPointerDown, this);
		this.input.on("pointermove", this.onPointerMove, this);
		this.input.on("pointerup", this.onPointerUp, this);
	}

	onPointerDown(pointer) {
		if (this.gameOver || !this.gameStarted) return;
		this.pointerDown = true;
		this.updateBasketPosition(pointer);
	}

	onPointerMove(pointer) {
		if (this.pointerDown) {
			this.updateBasketPosition(pointer);
		}
	}

	onPointerUp() {
		this.pointerDown = false;
	}

	updateBasketPosition(pointer) {
		const newX = Phaser.Math.Clamp(
			pointer.x,
			CATCH_CONFIG.BASKET_WIDTH / 2,
			400 - CATCH_CONFIG.BASKET_WIDTH / 2
		);
		this.basket.x = newX;
	}

	update() {
		if (this.gameOver || !this.gameStarted) {
			return;
		}

		// Update sprite manager
		this.spriteManager.update(this.ground);

		// Check collision between basket and sprites
		const basketBounds = new Phaser.Geom.Rectangle(
			this.basket.x - CATCH_CONFIG.BASKET_WIDTH / 2,
			this.basket.y - CATCH_CONFIG.BASKET_HEIGHT / 2,
			CATCH_CONFIG.BASKET_WIDTH,
			CATCH_CONFIG.BASKET_HEIGHT
		);

		const caughtCount = this.spriteManager.checkCollision(
			basketBounds,
			(sprite) => {
				// On catch callback
				this.score += 1;
				this.uiManager.updateScore(this.score);
			}
		);

		// Check for game over (sprite hits ground)
		if (this.spriteManager.isSpriteHittingGround()) {
			this.hitGround();
		}
	}

	startGame() {
		this.gameStarted = true;
		this.uiManager.hideStartText();
		this.spriteManager.startSpawning(this);
	}

	hitGround() {
		if (this.gameOver) return;

		this.gameOver = true;
		this.physics.pause();

		const { retryText } = this.uiManager.showGameOver(this.score);

		retryText.on("pointerdown", () => {
			this.restartGame();
		});
	}

	restartGame() {
		this.uiManager.clearEndGameUI();

		this.gameOver = false;
		this.gameStarted = false;
		this.score = 0;
		this.uiManager.resetScore();

		this.basket.x = CATCH_CONFIG.BASKET_START_X;

		if (this.spriteManager) {
			this.spriteManager.destroy();
		}

		this.spriteManager = new SpriteManager(this, this.selectedSprite);

		this.physics.resume();
	}
}

export default CatchScene;

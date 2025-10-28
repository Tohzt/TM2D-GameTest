import Phaser from "phaser";
import { HOCKEY_CONFIG } from "./config.js";
import { UIManager } from "../components/UIManager.js";
import { SpriteSelector } from "../components/SpriteSelector.js";

export class HockeyScene extends Phaser.Scene {
	constructor() {
		super({ key: "HockeyScene" });
	}

	preload() {
		// Load sprites for selection
		HOCKEY_CONFIG.SPRITES.forEach((sprite) => {
			this.load.image(sprite, `/assets/stickers/${sprite}.png`);
		});
	}

	create() {
		// Set world bounds for physics
		this.physics.world.setBounds(0, 0, 400, 600);

		this.add.rectangle(200, 300, 400, 600, 0x0a1929);

		// Create sprite selector
		this.spriteSelector = new SpriteSelector(this, {
			sprites: HOCKEY_CONFIG.SPRITES,
			spriteSpacing: HOCKEY_CONFIG.SPRITE_SPACING,
			spriteBoxSize: HOCKEY_CONFIG.SPRITE_BOX_SIZE,
			titleY: 100,
			spriteY: 250,
			gameName: "Hockey Game",
			title: "Choose your Puck!",
		});

		// Create UIManager with custom config
		this.uiManager = new UIManager(this, {
			gameId: "hockey",
			showScoreUI: false, // We'll handle scoring differently
			startMessage: "Click and drag to move!",
			startY: 350,
		});

		// Show sprite selection
		this.spriteSelector.showSelectionScreen((spriteKey) => {
			this.selectedSprite = spriteKey;
			this.initializeGame();
		});

		this.gameStarted = false;
		this.selectedSprite = null;
		this.scores = { bottom: 0, top: 0 }; // Best of 5
		this.gameOver = false;
		this.waitingForGoal = false;
		this.lastCollisionTime = 0;
		this.collisionCooldown = 100; // ms between collisions
		this.nextServeSide = null; // null = random, 'top' or 'bottom'
		this.puckVelocity = { x: 0, y: 0 }; // Track if puck is moving
	}

	initializeGame() {
		this.spriteSelector.clearSelectionScreen();
		this.createGameElements();
		this.createCenterLine();
		this.createScoreDisplay();
		this.uiManager.createGameUI();
		this.setupControls();
		this.gameStarted = false; // Wait for click to start
	}

	createGameElements() {
		// Bottom paddle (green circle)
		const bottomPaddleX = 200;
		const bottomPaddleY = HOCKEY_CONFIG.PADDLE_START_Y_BOTTOM;

		this.bottomPaddle = this.add.circle(
			bottomPaddleX,
			bottomPaddleY,
			30, // Same size as top paddle
			0x00ff00 // Green color
		);
		this.bottomPaddle.setDepth(HOCKEY_CONFIG.PADDLE_DEPTH);
		this.physics.add.existing(this.bottomPaddle);
		// Use circular collision with radius 30, centered at origin
		this.bottomPaddle.body.setCircle(30, 0, 0);
		this.bottomPaddle.body.setCollideWorldBounds(true);
		this.bottomPaddle.body.setImmovable(true);
		this.bottomPaddle.body.setBounce(1);
		this.bottomPaddle.body.setFriction(0);
		this.bottomPaddle.body.updateFromGameObject();

		console.log(`[Hockey] Bottom player created at:`, {
			x: bottomPaddleX,
			y: bottomPaddleY,
		});

		// Top paddle (red circle)
		this.topPaddle = this.add.circle(
			200,
			HOCKEY_CONFIG.PADDLE_START_Y_TOP,
			30, // 2x larger (was 15)
			HOCKEY_CONFIG.PADDLE_COLOR_TOP
		);
		this.topPaddle.setDepth(HOCKEY_CONFIG.PADDLE_DEPTH);
		this.physics.add.existing(this.topPaddle);
		// Use circular collision with radius 30, centered at origin
		this.topPaddle.body.setCircle(30, 0, 0);
		this.topPaddle.body.setBounce(1);
		this.topPaddle.body.setFriction(0);

		console.log(`[Hockey] Top player created at:`, {
			x: 200,
			y: HOCKEY_CONFIG.PADDLE_START_Y_TOP,
		});
		this.topPaddle.body.setCollideWorldBounds(true);
		this.topPaddle.body.setImmovable(true);
		this.topPaddle.body.updateFromGameObject();

		// Create puck (using selected sprite)
		this.puck = this.add.image(
			HOCKEY_CONFIG.PUCK_START_X,
			HOCKEY_CONFIG.PUCK_START_Y,
			this.selectedSprite
		);
		this.puck.setScale(0.3); // Scale it to puck size
		this.puck.setOrigin(0.5, 0.5);
		this.puck.setDepth(HOCKEY_CONFIG.PUCK_DEPTH);
		this.physics.add.existing(this.puck);
		this.puck.body.setCircle(HOCKEY_CONFIG.PUCK_SIZE / 2); // Circular collision
		this.puck.body.setCollideWorldBounds(true);
		this.puck.body.setBounce(1);
		this.puck.body.setFriction(0);

		// Use overlap to detect when puck touches paddle
		this.physics.add.overlap(this.puck, this.bottomPaddle, () => {
			this.bouncePuckOffPaddle(this.puck, this.bottomPaddle);
		});
		this.physics.add.overlap(this.puck, this.topPaddle, () => {
			this.bouncePuckOffPaddle(this.puck, this.topPaddle);
		});
	}

	createCenterLine() {
		// Bottom goal crease (half circle, half off-screen at bottom)
		this.add.circle(200, 600, 50, 0x4169e1, 0.3);
		this.add.circle(200, 600, 50, 0xff0000, 0, 2);

		// Top goal crease (half circle, half off-screen at top)
		this.add.circle(200, 0, 50, 0x4169e1, 0.3);
		this.add.circle(200, 0, 50, 0xff0000, 0, 2);

		// Blue lines (defensive/offensive zones)
		this.add
			.rectangle(200, 200, 380, 4, 0x0066cc, 1)
			.setDepth(HOCKEY_CONFIG.CENTER_LINE_DEPTH);

		this.add
			.rectangle(200, 400, 380, 4, 0x0066cc, 1)
			.setDepth(HOCKEY_CONFIG.CENTER_LINE_DEPTH);

		// Center line (red)
		this.add
			.rectangle(200, 300, 380, 4, 0xff0000, 1)
			.setDepth(HOCKEY_CONFIG.CENTER_LINE_DEPTH);

		// Center circle
		this.add.circle(200, 300, 30, 0xff0000, 0, 2);

		// Goal lines at edges
		this.add
			.rectangle(200, 600, 380, 4, 0xffffff, 1)
			.setDepth(HOCKEY_CONFIG.CENTER_LINE_DEPTH);

		this.add
			.rectangle(200, 0, 380, 4, 0xffffff, 1)
			.setDepth(HOCKEY_CONFIG.CENTER_LINE_DEPTH);
	}

	createScoreDisplay() {
		// Bottom player score (bottom left)
		this.bottomScoreText = this.add.text(30, 560, "0", {
			fontSize: "32px",
			fill: "#00ff00",
			fontFamily: "Arial",
			fontStyle: "bold",
		});
		this.bottomScoreText.setDepth(HOCKEY_CONFIG.UI_DEPTH);

		// Top player score (top left)
		this.topScoreText = this.add.text(30, 20, "0", {
			fontSize: "32px",
			fill: "#ff0000",
			fontFamily: "Arial",
			fontStyle: "bold",
		});
		this.topScoreText.setDepth(HOCKEY_CONFIG.UI_DEPTH);

		this.matchText = this.add.text(200, 100, "First to 3 wins!", {
			fontSize: "20px",
			fill: "#ffffff",
			fontFamily: "Arial",
		});
		this.matchText.setOrigin(0.5);
		this.matchText.setDepth(HOCKEY_CONFIG.UI_DEPTH);
	}

	setupControls() {
		this.activePaddle = null; // Track which paddle is being dragged

		this.input.on("pointerdown", (pointer) => {
			if (!this.gameStarted && !this.gameOver) {
				this.startGame();
				return;
			}

			if (!this.gameOver && this.gameStarted) {
				// Handle paddle movement
				// Determine which paddle to control based on click position
				if (pointer.y < 300) {
					// Top half - control top paddle
					this.activePaddle = this.topPaddle;
				} else {
					// Bottom half - control bottom paddle
					this.activePaddle = this.bottomPaddle;
				}
				// Don't move on click - only start dragging
			}
		});

		this.input.on("pointermove", (pointer) => {
			if (this.activePaddle && !this.gameOver && this.gameStarted) {
				this.updatePaddlePosition(pointer);
			}
		});

		this.input.on("pointerup", () => {
			this.activePaddle = null;
		});
	}

	updatePaddlePosition(pointer) {
		if (!this.activePaddle) return;

		// Constrain X position - using circle radius (30) not paddle width
		const circleRadius = 30;
		const clampedX = Phaser.Math.Clamp(
			pointer.x,
			circleRadius,
			400 - circleRadius
		);

		// Constrain Y position to entire half the field
		let clampedY;
		if (this.activePaddle === this.topPaddle) {
			// Top player can move across entire top half (from ~80 to 300)
			clampedY = Phaser.Math.Clamp(pointer.y, 80, 300);
		} else {
			// Bottom player can move across entire bottom half (from 300 to ~520)
			clampedY = Phaser.Math.Clamp(pointer.y, 300, 520);
		}

		this.activePaddle.x = clampedX;
		this.activePaddle.y = clampedY;
	}

	startGame() {
		this.gameStarted = true;
		this.uiManager.hideStartText();
		this.matchText.destroy();

		// Position puck on blue line, don't start it moving yet
		this.servePuck();
	}

	servePuck() {
		// Determine which side to serve from
		let serveSide = this.nextServeSide;
		if (!serveSide) {
			// Random for first serve
			serveSide = Math.random() < 0.5 ? "top" : "bottom";
		}

		// Position puck on the blue line of the serving side
		if (serveSide === "top") {
			// Position on top blue line (y=200)
			this.puck.x = 200;
			this.puck.y = 200;
		} else {
			// Position on bottom blue line (y=400)
			this.puck.x = 200;
			this.puck.y = 400;
		}

		this.puck.body.setVelocity(0, 0);
		this.puck.body.updateFromGameObject();
		this.puckServed = false; // Flag to track if puck has been served
	}

	checkPuckServed() {
		return !this.puckServed;
	}

	servePuckWithVelocity() {
		// Determine which side we're serving from
		let serveSide = this.nextServeSide;
		if (!serveSide) {
			serveSide = this.puck.y === 200 ? "top" : "bottom";
		}

		// Serve towards the other player's side
		let targetY, startSpeed;
		if (serveSide === "top") {
			targetY = 400; // Serve towards bottom
			startSpeed = 250;
		} else {
			targetY = 200; // Serve towards top
			startSpeed = -250;
		}

		// Calculate angle towards other side
		const angle = Phaser.Math.Between(-30, 30) * (Math.PI / 180);
		this.puck.body.setVelocity(
			Math.sin(angle) * startSpeed,
			-Math.abs(startSpeed) * Math.cos(angle)
		);

		this.puckServed = true;
	}

	update() {
		if (!this.gameStarted || this.gameOver || this.waitingForGoal) {
			return;
		}

		// Sync physics bodies with visual positions for accurate collision
		this.bottomPaddle.body.updateFromGameObject();
		this.topPaddle.body.updateFromGameObject();

		// Handle puck-paddle collisions
		this.checkPaddleCollisions();

		// Clamp puck position only if it escapes bounds
		const puckRadius = HOCKEY_CONFIG.PUCK_SIZE / 2;
		if (this.puck.x < puckRadius) {
			this.puck.x = puckRadius;
			this.puck.body.setVelocityX(Math.abs(this.puck.body.velocity.x));
		} else if (this.puck.x > 400 - puckRadius) {
			this.puck.x = 400 - puckRadius;
			this.puck.body.setVelocityX(-Math.abs(this.puck.body.velocity.x));
		}

		if (this.puck.y < puckRadius) {
			this.puck.y = puckRadius;
			this.puck.body.setVelocityY(Math.abs(this.puck.body.velocity.y));
		} else if (this.puck.y > 600 - puckRadius) {
			this.puck.y = 600 - puckRadius;
			this.puck.body.setVelocityY(-Math.abs(this.puck.body.velocity.y));
		}

		// Check for goals only in the goal crease areas (semi-circles)
		const puckY = this.puck.y;
		const puckX = this.puck.x;
		const centerX = 200;
		const creaseRadius = 50;

		// Top goal crease is centered at (200, 0)
		const distanceFromTopGoal = Math.sqrt(
			Math.pow(puckX - centerX, 2) + Math.pow(puckY - 0, 2)
		);

		// Bottom goal crease is centered at (200, 600)
		const distanceFromBottomGoal = Math.sqrt(
			Math.pow(puckX - centerX, 2) + Math.pow(puckY - 600, 2)
		);

		// Check if puck is within the goal crease circle
		if (
			distanceFromTopGoal < creaseRadius &&
			puckY < 25 &&
			!this.waitingForGoal
		) {
			this.handleGoal("bottom"); // Bottom player (green) scores when puck goes in top
		} else if (
			distanceFromBottomGoal < creaseRadius &&
			puckY > 575 &&
			!this.waitingForGoal
		) {
			this.handleGoal("top"); // Top player (red) scores when puck goes in bottom
		}
	}

	checkPaddleCollisions() {
		const currentTime = this.time.now;

		// Skip if within cooldown period
		if (currentTime - this.lastCollisionTime < this.collisionCooldown) {
			return;
		}

		const puck = this.puck;
		const puckRadius = 10; // HOCKEY_CONFIG.PUCK_SIZE / 2 = 10
		const paddleRadius = 30;

		// Check collision with bottom paddle
		const dx1 = puck.x - this.bottomPaddle.x;
		const dy1 = puck.y - this.bottomPaddle.y;
		const distance1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);

		if (distance1 < puckRadius + paddleRadius) {
			// Update collision time
			this.lastCollisionTime = currentTime;

			// Push puck away from paddle
			const angle = Math.atan2(dy1, dx1);
			const overlap = puckRadius + paddleRadius - distance1;
			puck.x += Math.cos(angle) * overlap;
			puck.y += Math.sin(angle) * overlap;

			// If puck is stationary, give it initial velocity
			if (puck.body.velocity.x === 0 && puck.body.velocity.y === 0) {
				// Paddle is moving, so give puck velocity based on paddle movement direction
				const defaultSpeed = 300;
				const randomAngle = Phaser.Math.Between(-45, 45) * (Math.PI / 180);
				puck.body.setVelocity(
					Math.sin(randomAngle) * defaultSpeed,
					-Math.cos(randomAngle) * defaultSpeed
				);
				this.puckServed = true;
			} else {
				// Reflect velocity for moving puck
				const normalX = dx1 / distance1;
				const normalY = dy1 / distance1;
				const dot =
					puck.body.velocity.x * normalX + puck.body.velocity.y * normalY;
				puck.body.setVelocity(
					puck.body.velocity.x - 2 * dot * normalX,
					puck.body.velocity.y - 2 * dot * normalY
				);
			}
			return; // Only process one collision per frame
		}

		// Check collision with top paddle
		const dx2 = puck.x - this.topPaddle.x;
		const dy2 = puck.y - this.topPaddle.y;
		const distance2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

		if (distance2 < puckRadius + paddleRadius) {
			// Update collision time
			this.lastCollisionTime = currentTime;

			// Push puck away from paddle
			const angle = Math.atan2(dy2, dx2);
			const overlap = puckRadius + paddleRadius - distance2;
			puck.x += Math.cos(angle) * overlap;
			puck.y += Math.sin(angle) * overlap;

			// If puck is stationary, give it initial velocity
			if (puck.body.velocity.x === 0 && puck.body.velocity.y === 0) {
				// Paddle is moving, so give puck velocity based on paddle movement direction
				const defaultSpeed = 300;
				const randomAngle = Phaser.Math.Between(-45, 45) * (Math.PI / 180);
				puck.body.setVelocity(
					Math.sin(randomAngle) * defaultSpeed,
					Math.cos(randomAngle) * defaultSpeed
				);
				this.puckServed = true;
			} else {
				// Reflect velocity for moving puck
				const normalX = dx2 / distance2;
				const normalY = dy2 / distance2;
				const dot =
					puck.body.velocity.x * normalX + puck.body.velocity.y * normalY;
				puck.body.setVelocity(
					puck.body.velocity.x - 2 * dot * normalX,
					puck.body.velocity.y - 2 * dot * normalY
				);
			}
		}
	}

	bouncePuckOffPaddle(puck, paddle) {
		// This is called by overlap but manual collision is handled in update
	}

	handleGoal(scorer) {
		this.waitingForGoal = true;
		this.scores[scorer]++;

		// Stop the puck immediately
		this.puck.body.setVelocity(0, 0);

		// Update score display
		if (scorer === "bottom") {
			this.bottomScoreText.setText(this.scores.bottom.toString());
		} else {
			this.topScoreText.setText(this.scores.top.toString());
		}

		// Check for match winner
		if (this.scores.bottom >= HOCKEY_CONFIG.MAX_SCORE) {
			this.endMatch("bottom");
		} else if (this.scores.top >= HOCKEY_CONFIG.MAX_SCORE) {
			this.endMatch("top");
		} else {
			// Set next serve to be on the scoring player's side
			// If bottom (green) scores, next serve is on top (red) side
			// If top (red) scores, next serve is on bottom (green) side
			this.nextServeSide = scorer === "bottom" ? "top" : "bottom";

			// Reset puck position after delay
			this.time.delayedCall(HOCKEY_CONFIG.RESET_DELAY, () => {
				this.resetPuck();
			});
		}
	}

	resetPuck() {
		// Serve puck on the appropriate side
		this.servePuck();
		this.waitingForGoal = false;
	}

	endMatch(winner) {
		this.gameOver = true;
		this.physics.pause();

		const winnerName = winner === "bottom" ? "Green Wins!" : "Red Wins!";
		const winnerColor = winner === "bottom" ? "#00ff00" : "#ff0000";

		const background = this.add.rectangle(200, 300, 350, 200, 0x000000, 0.9);
		background.setStrokeStyle(4, winner === "bottom" ? 0x00ff00 : 0xff0000);
		background.setDepth(18);
		background.setInteractive();

		const titleText = this.add
			.text(200, 250, winnerName, {
				fontSize: "36px",
				fill: winnerColor,
				fontFamily: "Arial",
				align: "center",
				fontStyle: "bold",
			})
			.setOrigin(0.5);
		titleText.setDepth(20);

		const retryBg = this.add.rectangle(200, 340, 100, 40, 0xffff00);
		retryBg.setStrokeStyle(2, 0xffffff);
		retryBg.setDepth(19);
		retryBg.setInteractive({ useHandCursor: true });

		const retryText = this.add
			.text(200, 340, "Retry", {
				fontSize: "24px",
				fill: "#000000",
				fontFamily: "Arial",
			})
			.setOrigin(0.5)
			.setInteractive({ useHandCursor: true });
		retryText.setDepth(20);

		retryText.on("pointerdown", () => {
			this.restartGame();
		});
	}

	restartGame() {
		this.uiManager.clearEndGameUI();

		// Destroy old elements
		this.bottomPaddle.destroy();
		this.topPaddle.destroy();
		this.puck.destroy();

		this.gameOver = false;
		this.gameStarted = false;
		this.scores = { bottom: 0, top: 0 };
		this.waitingForGoal = false;

		this.bottomScoreText.setText("0");
		this.topScoreText.setText("0");

		// Recreate game elements
		this.createGameElements();
		this.uiManager.createGameUI();

		// Reset puck position without starting
		this.puck.x = HOCKEY_CONFIG.PUCK_START_X;
		this.puck.y = HOCKEY_CONFIG.PUCK_START_Y;
		this.puck.body.setVelocity(0, 0);

		this.physics.resume();
	}
}

export default HockeyScene;

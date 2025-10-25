import Phaser from "phaser";

class GameScene extends Phaser.Scene {
	constructor() {
		super({ key: "GameScene" });
	}

	preload() {
		// We'll create simple shapes instead of loading images
	}

	create() {
		// Create bird (simple circle with border)
		this.bird = this.add.circle(100, 250, 15, 0xffff00);
		this.bird.setStrokeStyle(3, 0xffaa00); // Orange border
		this.physics.add.existing(this.bird);
		this.bird.body.setCollideWorldBounds(true);
		this.bird.body.setGravityY(0); // Start with no gravity
		this.bird.setDepth(5); // Put bird above pipes but below UI

		// Create ground
		this.ground = this.add.rectangle(200, 580, 400, 40, 0x8b4513);
		this.physics.add.existing(this.ground, true);
		this.ground.setDepth(10); // Put ground on top

		// Create pipe group
		this.pipes = this.physics.add.group();

		// Game state
		this.score = 0;
		this.gameOver = false;
		this.gameStarted = false;
		this.highScore = parseInt(
			localStorage.getItem("flappyBirdHighScore") || "0"
		);

		// Score text
		this.scoreText = this.add.text(16, 16, "Score: 0", {
			fontSize: "32px",
			fill: "#fff",
			fontFamily: "Arial",
		});
		this.scoreText.setDepth(20); // Put score text on top of everything

		// High score text
		this.highScoreText = this.add.text(384, 16, `High: ${this.highScore}`, {
			fontSize: "24px",
			fill: "#fff",
			fontFamily: "Arial",
		});
		this.highScoreText.setOrigin(1, 0); // Right-align the text
		this.highScoreText.setDepth(20); // Put high score text on top of everything

		// Start screen text
		this.startText = this.add
			.text(200, 250, "Tap to Start!\nAvoid the pipes", {
				fontSize: "24px",
				fill: "#fff",
				fontFamily: "Arial",
				align: "center",
			})
			.setOrigin(0.5);
		this.startText.setDepth(20); // Put start text on top

		// Input handling - tap/click anywhere to start/flap
		this.input.on("pointerdown", this.startOrFlap, this);

		// Check collisions
		this.physics.add.collider(
			this.bird,
			this.ground,
			this.hitObstacle,
			null,
			this
		);
		this.physics.add.overlap(
			this.bird,
			this.pipes,
			this.hitObstacle,
			null,
			this
		);
	}

	update() {
		if (this.gameOver || !this.gameStarted) {
			return;
		}

		// Check if bird fell below screen
		if (this.bird.y > 600) {
			this.hitObstacle();
		}

		// Rotate bird based on velocity
		const angle = Phaser.Math.Clamp(this.bird.body.velocity.y * 0.1, -30, 90);
		this.bird.angle = angle;

		// Check for scoring and remove pipes that are off screen
		this.pipes.children.entries.forEach((pipe) => {
			// Check if bird has safely passed through the pipe gap (scoring)
			// Add 30px offset so you only score when safely past the pipe
			if (pipe.x < this.bird.x - 30 && !pipe.scored) {
				pipe.scored = true;
				// Only score once per pipe pair (check if this is the top pipe)
				if (pipe.y < 300) {
					// Top pipe is above center
					this.score += 1;
					this.scoreText.setText("Score: " + this.score);

					// Check for new high score
					if (this.score > this.highScore) {
						this.highScore = this.score;
						this.highScoreText.setText(`High: ${this.highScore}`);
						localStorage.setItem(
							"flappyBirdHighScore",
							this.highScore.toString()
						);
					}
				}
			}

			// Remove pipes that are off screen
			if (pipe.x < -100) {
				pipe.destroy();
			}
		});
	}

	startOrFlap() {
		if (this.gameOver) {
			this.restartGame();
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
		this.bird.body.setGravityY(1000); // Enable gravity
		this.startText.destroy(); // Remove start text

		// Start spawning pipes
		this.time.addEvent({
			delay: 2000,
			callback: () => {
				this.spawnPipes();
			},
			loop: true,
		});

		this.flap(); // Initial flap
	}

	flap() {
		if (!this.gameStarted) return;

		this.bird.body.setVelocityY(-350);
	}

	spawnPipes() {
		if (this.gameOver) return;

		const gap = 120; // Gap between pipes
		const gapPosition = Phaser.Math.Between(150, 450); // Center of the gap

		// Top pipe (green with darker border) - positioned above the gap
		const topPipeY = gapPosition - gap / 2 - 250; // 250px above gap center
		const topPipe = this.add.rectangle(450, topPipeY, 60, 500, 0x00ff00);
		this.physics.add.existing(topPipe);
		topPipe.body.allowGravity = false;
		topPipe.setStrokeStyle(4, 0x00aa00); // Dark green border
		this.pipes.add(topPipe);

		// Set velocity after a small delay to ensure physics body is ready
		this.time.delayedCall(10, () => {
			if (topPipe.body) {
				topPipe.body.setVelocityX(-100);
			}
		});

		// Bottom pipe (green with darker border) - positioned below the gap
		const bottomPipeY = gapPosition + gap / 2 + 250; // 250px below gap center
		const bottomPipe = this.add.rectangle(450, bottomPipeY, 60, 500, 0x00ff00);
		this.physics.add.existing(bottomPipe);
		bottomPipe.body.allowGravity = false;
		bottomPipe.setStrokeStyle(4, 0x00aa00); // Dark green border
		this.pipes.add(bottomPipe);

		// Set velocity after a small delay to ensure physics body is ready
		this.time.delayedCall(10, () => {
			if (bottomPipe.body) {
				bottomPipe.body.setVelocityX(-100);
			}
		});
	}

	hitObstacle() {
		if (this.gameOver) return;

		this.gameOver = true;
		this.physics.pause();
		this.bird.setFillStyle(0xff0000); // Change color instead of tint

		// Game over text
		const gameOverText = this.add
			.text(200, 250, "Game Over!\nTap to Restart", {
				fontSize: "32px",
				fill: "#fff",
				fontFamily: "Arial",
				align: "center",
			})
			.setOrigin(0.5);
		gameOverText.setDepth(20); // Put game over text on top
	}

	restartGame() {
		this.gameOver = false;
		this.gameStarted = false;
		this.score = 0;
		this.scoreText.setText("Score: 0"); // Reset score display
		this.scene.restart();
	}
}

// Game configuration
const config = {
	type: Phaser.AUTO,
	scale: {
		mode: Phaser.Scale.FIT,
		autoCenter: Phaser.Scale.CENTER_BOTH,
		width: 400,
		height: 600,
	},
	parent: "game-container",
	backgroundColor: "#4ec0ca",
	physics: {
		default: "arcade",
		arcade: {
			gravity: { y: 0 }, // Start with no gravity
			debug: false,
		},
	},
	scene: GameScene,
};

export default config;

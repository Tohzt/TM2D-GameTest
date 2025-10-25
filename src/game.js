import Phaser from "phaser";

class GameScene extends Phaser.Scene {
	constructor() {
		super({ key: "GameScene" });
	}

	preload() {
		// Load all sprite images from the stickers directory
		this.load.image("Cherry_1", "/assets/stickers/Cherry_1.png");
		this.load.image("Cherry_2", "/assets/stickers/Cherry_2.png");
	}

	create() {
		// Show sprite selection screen
		this.showSpriteSelection();

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
		this.spriteSelected = false;
		this.selectedSprite = null;
		this.highScore = parseInt(
			localStorage.getItem("flappyBirdHighScore") || "0"
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
		this.birdCollision.body.setGravityY(1000); // Enable gravity on collision circle
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

		this.birdCollision.body.setVelocityY(-350);
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
		this.bird.setTint(0xff0000); // Red tint for game over effect

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

	showSpriteSelection() {
		// Title text
		this.add
			.text(200, 100, "Choose Your Character!", {
				fontSize: "28px",
				fill: "#fff",
				fontFamily: "Arial",
				align: "center",
			})
			.setOrigin(0.5)
			.setDepth(20);

		// Available sprites
		const sprites = ["Cherry_1", "Cherry_2"];
		const spriteSpacing = 180; // Increased spacing for larger sprites
		const startX = 200 - ((sprites.length - 1) * spriteSpacing) / 2;

		sprites.forEach((spriteKey, index) => {
			const x = startX + index * spriteSpacing;
			const y = 250;

			// Create bordered box for sprite (larger for 128x128 sprites)
			const box = this.add.rectangle(x, y, 140, 140, 0x000000, 0.3);
			box.setStrokeStyle(4, 0xffffff);
			box.setDepth(14);
			box.setInteractive();

			// Create sprite preview
			const sprite = this.add.image(x, y, spriteKey);
			sprite.setScale(1.0); // Perfect size for 128x128 sprites
			sprite.setDepth(15);

			// Add click handler to both box and sprite
			const clickHandler = () => {
				this.selectSprite(spriteKey);
			};

			box.on("pointerdown", clickHandler);
			sprite.on("pointerdown", clickHandler);

			// Add hover effect
			const hoverIn = () => {
				sprite.setTint(0xcccccc);
				box.setStrokeStyle(4, 0xffff00); // Yellow border on hover
			};
			const hoverOut = () => {
				sprite.clearTint();
				box.setStrokeStyle(4, 0xffffff); // White border normal
			};

			box.on("pointerover", hoverIn);
			box.on("pointerout", hoverOut);
			sprite.on("pointerover", hoverIn);
			sprite.on("pointerout", hoverOut);
		});
	}

	selectSprite(spriteKey) {
		this.selectedSprite = spriteKey;
		this.spriteSelected = true;

		// Clear all selection screen elements
		this.children.list.slice().forEach((child) => {
			if (child.depth === 14 || child.depth === 15 || child.depth === 20) {
				child.destroy();
			}
		});

		// Create bird with selected sprite (visual only, no physics)
		this.bird = this.add.image(100, 250, spriteKey);
		this.bird.setScale(0.4); // Slightly larger for 128x128 sprites (51x51 in game)
		this.bird.setDepth(5); // Put bird above pipes but below UI

		// Create invisible circular collision area
		this.birdCollision = this.add.circle(100, 250, 18, 0x000000, 0); // 36px diameter (18px radius), invisible
		this.physics.add.existing(this.birdCollision);
		this.birdCollision.body.setCollideWorldBounds(true);
		this.birdCollision.body.setGravityY(0);
		this.birdCollision.setDepth(1); // Below everything

		// Recreate UI elements
		this.scoreText = this.add.text(16, 16, "Score: 0", {
			fontSize: "32px",
			fill: "#fff",
			fontFamily: "Arial",
		});
		this.scoreText.setDepth(20);

		this.highScoreText = this.add.text(384, 16, `High: ${this.highScore}`, {
			fontSize: "24px",
			fill: "#fff",
			fontFamily: "Arial",
		});
		this.highScoreText.setOrigin(1, 0);
		this.highScoreText.setDepth(20);

		// Start screen text
		this.startText = this.add
			.text(200, 250, "Tap to Start!\nAvoid the pipes", {
				fontSize: "24px",
				fill: "#fff",
				fontFamily: "Arial",
				align: "center",
			})
			.setOrigin(0.5);
		this.startText.setDepth(20);

		// Input handling - tap/click anywhere to start/flap
		this.input.on("pointerdown", this.startOrFlap, this);

		// Check collisions using the collision circle
		this.physics.add.collider(
			this.birdCollision,
			this.ground,
			this.hitObstacle,
			null,
			this
		);
		this.physics.add.overlap(
			this.birdCollision,
			this.pipes,
			this.hitObstacle,
			null,
			this
		);
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

import { FLAPPY_CONFIG } from "./config.js";

export class UIManager {
	constructor(scene) {
		this.scene = scene;
		this.scoreText = null;
		this.highScoreText = null;
		this.startText = null;
		this.highScore = parseInt(
			localStorage.getItem("flappyBirdHighScore") || "0"
		);
	}

	createGameUI() {
		// Create score text
		this.scoreText = this.scene.add.text(16, 16, "Score: 0", {
			fontSize: "32px",
			fill: "#fff",
			fontFamily: "Arial",
		});
		this.scoreText.setDepth(FLAPPY_CONFIG.UI_DEPTH);

		// Create high score text
		this.highScoreText = this.scene.add.text(
			384,
			16,
			`High: ${this.highScore}`,
			{
				fontSize: "24px",
				fill: "#fff",
				fontFamily: "Arial",
			}
		);
		this.highScoreText.setOrigin(1, 0);
		this.highScoreText.setDepth(FLAPPY_CONFIG.UI_DEPTH);

		// Start screen text
		this.startText = this.scene.add
			.text(200, 250, "Tap to Start!\nAvoid the pipes", {
				fontSize: "24px",
				fill: "#fff",
				fontFamily: "Arial",
				align: "center",
			})
			.setOrigin(0.5);
		this.startText.setDepth(FLAPPY_CONFIG.UI_DEPTH);
	}

	updateScore(score) {
		if (this.scoreText) {
			this.scoreText.setText("Score: " + score);
		}

		if (score > this.highScore) {
			this.highScore = score;
			this.updateHighScore(score);
			localStorage.setItem("flappyBirdHighScore", score.toString());
		}
	}

	updateHighScore(score) {
		if (this.highScoreText) {
			this.highScoreText.setText(`High: ${score}`);
		}
	}

	hideStartText() {
		if (this.startText) {
			this.startText.destroy();
		}
	}

	resetScore() {
		if (this.scoreText) {
			this.scoreText.setText("Score: 0");
		}
	}

	showGameOver() {
		const retryText = this.scene.add
			.text(200, 280, "Tap to Restart", {
				fontSize: "24px",
				fill: "#ffff00",
				fontFamily: "Arial",
			})
			.setOrigin(0.5)
			.setInteractive({ useHandCursor: true });
		retryText.setDepth(FLAPPY_CONFIG.UI_DEPTH);

		const menuText = this.scene.add
			.text(200, 340, "Menu", {
				fontSize: "24px",
				fill: "#4ec0ca",
				fontFamily: "Arial",
			})
			.setOrigin(0.5)
			.setInteractive({ useHandCursor: true });
		menuText.setDepth(FLAPPY_CONFIG.UI_DEPTH);

		return { retryText, menuText };
	}
}

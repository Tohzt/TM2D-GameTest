import { TAPS_CONFIG } from "./config.js";

export class UIManager {
	constructor(scene) {
		this.scene = scene;
		this.scoreText = null;
		this.highScoreText = null;
		this.timerText = null;
		this.startText = null;
		this.highScore = parseInt(localStorage.getItem("tapsHighScore") || "0");
	}

	createGameUI() {
		// Create score text
		this.scoreText = this.scene.add.text(16, 16, "Score: 0", {
			fontSize: "32px",
			fill: "#fff",
			fontFamily: "Arial",
		});
		this.scoreText.setDepth(TAPS_CONFIG.UI_DEPTH);

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
		this.highScoreText.setDepth(TAPS_CONFIG.UI_DEPTH);

		// Create timer text
		this.timerText = this.scene.add.text(200, 16, "30.0s", {
			fontSize: "24px",
			fill: "#ff0000",
			fontFamily: "Arial",
		});
		this.timerText.setOrigin(0.5, 0);
		this.timerText.setDepth(TAPS_CONFIG.UI_DEPTH);

		// Start screen text
		this.startText = this.scene.add
			.text(200, 250, "Tap to Start!\nClimb as high as you can!", {
				fontSize: "20px",
				fill: "#fff",
				fontFamily: "Arial",
				align: "center",
			})
			.setOrigin(0.5);
		this.startText.setDepth(TAPS_CONFIG.UI_DEPTH);
	}

	updateScore(score) {
		if (this.scoreText) {
			this.scoreText.setText(`Score: ${score}`);
		}

		if (score > this.highScore) {
			this.highScore = score;
			this.updateHighScore(score);
			localStorage.setItem("tapsHighScore", score.toString());
		}
	}

	updateHighScore(score) {
		if (this.highScoreText) {
			this.highScoreText.setText(`High: ${score}`);
		}
	}

	updateTimer(timer) {
		if (this.timerText) {
			this.timerText.setText(`${timer.toFixed(1)}s`);
		}
	}

	showGameOver(score) {
		const background = this.scene.add.rectangle(
			200,
			300,
			350,
			250,
			0x000000,
			0.8
		);
		background.setStrokeStyle(4, 0xffffff);
		background.setDepth(18);
		background.setInteractive();

		const gameOverText = this.scene.add
			.text(200, 300, "Game Over!", {
				fontSize: "32px",
				fill: "#fff",
				fontFamily: "Arial",
				align: "center",
			})
			.setOrigin(0.5);
		gameOverText.setDepth(20);

		const restartText = this.scene.add
			.text(200, 370, "Tap to Restart", {
				fontSize: "24px",
				fill: "#ffff00",
				fontFamily: "Arial",
			})
			.setOrigin(0.5)
			.setInteractive({ useHandCursor: true });
		restartText.setDepth(20);

		const menuText = this.scene.add
			.text(200, 450, "Menu", {
				fontSize: "24px",
				fill: "#4ec0ca",
				fontFamily: "Arial",
			})
			.setOrigin(0.5)
			.setInteractive({ useHandCursor: true });
		menuText.setDepth(20);

		return { restartText, menuText, gameOverText };
	}

	showTimeUp() {
		const background = this.scene.add.rectangle(
			200,
			300,
			350,
			250,
			0x000000,
			0.8
		);
		background.setStrokeStyle(4, 0xffffff);
		background.setDepth(18);
		background.setInteractive();

		const successText = this.scene.add
			.text(200, 300, "Time Up!", {
				fontSize: "32px",
				fill: "#00ff00",
				fontFamily: "Arial",
				align: "center",
			})
			.setOrigin(0.5);
		successText.setDepth(20);

		const restartText = this.scene.add
			.text(200, 370, "Tap to Continue", {
				fontSize: "24px",
				fill: "#ffff00",
				fontFamily: "Arial",
			})
			.setOrigin(0.5)
			.setInteractive({ useHandCursor: true });
		restartText.setDepth(20);

		const menuText = this.scene.add
			.text(200, 450, "Menu", {
				fontSize: "24px",
				fill: "#4ec0ca",
				fontFamily: "Arial",
			})
			.setOrigin(0.5)
			.setInteractive({ useHandCursor: true });
		menuText.setDepth(20);

		return { restartText, menuText, successText };
	}

	showScoreIncrease(x, y) {
		const increaseText = this.scene.add
			.text(x, y, "+1", {
				fontSize: "32px",
				fill: "#00ff00",
				fontFamily: "Arial",
				fontStyle: "bold",
			})
			.setOrigin(0.5);
		increaseText.setDepth(TAPS_CONFIG.EFFECTS_DEPTH);

		this.scene.tweens.add({
			targets: increaseText,
			y: y - 50,
			alpha: 0,
			duration: 500,
			onComplete: () => {
				increaseText.destroy();
			},
		});
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

	getHighScore() {
		return this.highScore;
	}
}

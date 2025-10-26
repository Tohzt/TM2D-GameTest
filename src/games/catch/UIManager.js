import { CATCH_CONFIG } from "./config.js";

export class UIManager {
	constructor(scene) {
		this.scene = scene;
		this.scoreText = null;
		this.highScoreText = null;
		this.startText = null;
		this.highScore = parseInt(localStorage.getItem("catchHighScore") || "0");
		this.endGameElements = [];
	}

	createGameUI() {
		this.scoreText = this.scene.add.text(16, 16, "Score: 0", {
			fontSize: "28px",
			fill: "#fff",
			fontFamily: "Arial",
		});
		this.scoreText.setDepth(CATCH_CONFIG.UI_DEPTH);

		this.highScoreText = this.scene.add.text(
			384,
			16,
			`High: ${this.highScore}`,
			{
				fontSize: "28px",
				fill: "#fff",
				fontFamily: "Arial",
			}
		);
		this.highScoreText.setOrigin(1, 0);
		this.highScoreText.setDepth(CATCH_CONFIG.UI_DEPTH);

		this.startText = this.scene.add
			.text(200, 250, "Tap to Start!\nCatch the falling sprites!", {
				fontSize: "24px",
				fill: "#fff",
				fontFamily: "Arial",
				align: "center",
			})
			.setOrigin(0.5);
		this.startText.setDepth(CATCH_CONFIG.UI_DEPTH);
	}

	updateScore(score) {
		if (this.scoreText) {
			this.scoreText.setText("Score: " + score);
		}

		if (score > this.highScore) {
			this.highScore = score;
			this.updateHighScore(score);
			localStorage.setItem("catchHighScore", score.toString());
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
			this.startText = null;
		}
	}

	resetScore() {
		if (this.scoreText) {
			this.scoreText.setText("Score: 0");
		}
	}

	showGameOver(score) {
		this.clearEndGameUI();

		const background = this.scene.add.rectangle(
			200,
			300,
			350,
			280,
			0x000000,
			0.8
		);
		background.setStrokeStyle(4, 0xffffff);
		background.setDepth(18);
		background.setInteractive();
		this.endGameElements.push(background);

		const titleText = this.scene.add
			.text(200, 230, "Game Over!", {
				fontSize: "32px",
				fill: "#fff",
				fontFamily: "Arial",
				align: "center",
			})
			.setOrigin(0.5);
		titleText.setDepth(CATCH_CONFIG.UI_DEPTH);
		this.endGameElements.push(titleText);

		const scoreText = this.scene.add
			.text(200, 270, `Score: ${score}`, {
				fontSize: "24px",
				fill: "#fff",
				fontFamily: "Arial",
				align: "center",
			})
			.setOrigin(0.5);
		scoreText.setDepth(CATCH_CONFIG.UI_DEPTH);
		this.endGameElements.push(scoreText);

		const retryBg = this.scene.add.rectangle(140, 380, 100, 40, 0xffff00);
		retryBg.setStrokeStyle(2, 0xffffff);
		retryBg.setDepth(19);
		retryBg.setInteractive({ useHandCursor: true });
		this.endGameElements.push(retryBg);

		const retryText = this.scene.add
			.text(140, 380, "Retry", {
				fontSize: "24px",
				fill: "#000000",
				fontFamily: "Arial",
			})
			.setOrigin(0.5)
			.setInteractive({ useHandCursor: true });
		retryText.setDepth(CATCH_CONFIG.UI_DEPTH);
		this.endGameElements.push(retryText);

		const quitBg = this.scene.add.rectangle(260, 380, 100, 40, 0xff0000);
		quitBg.setStrokeStyle(2, 0xffffff);
		quitBg.setDepth(19);
		quitBg.setInteractive({ useHandCursor: true });
		this.endGameElements.push(quitBg);

		const quitText = this.scene.add
			.text(260, 380, "Quit", {
				fontSize: "24px",
				fill: "#fff",
				fontFamily: "Arial",
			})
			.setOrigin(0.5)
			.setInteractive({ useHandCursor: true });
		quitText.setDepth(CATCH_CONFIG.UI_DEPTH);
		this.endGameElements.push(quitText);

		return { retryText, quitText };
	}

	clearEndGameUI() {
		this.endGameElements.forEach((element) => {
			if (element && element.destroy) {
				element.destroy();
			}
		});
		this.endGameElements = [];
	}
}

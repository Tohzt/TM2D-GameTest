import { FROGGER_CONFIG } from "./config.js";
import { UIManager as BaseUIManager } from "../components/UIManager.js";

// Wrapper for Frogger game that uses the shared UIManager
// Note: Frogger doesn't use traditional score tracking
export class UIManager {
	constructor(scene) {
		this.scene = scene;
		// Use the shared UIManager with Frogger-specific config
		this.baseUI = new BaseUIManager(scene, {
			gameId: "frogger",
			startMessage: "Tap to Start!\nCross the road safely!",
			startY: 250,
			uiDepth: FROGGER_CONFIG.UI_DEPTH,
			// Don't show score/high score UI elements
			showScoreUI: false,
		});

		this.startText = null;
		this.endGameElements = [];
	}

	createGameUI() {
		// Only show start message, not score UI
		this.startText = this.scene.add.text(
			200,
			250,
			"Tap to Start!\nCross the road safely!",
			{
				fontSize: "24px",
				fill: "#fff",
				fontFamily: "Arial",
				align: "center",
			}
		);
		this.startText.setOrigin(0.5);
		this.startText.setDepth(FROGGER_CONFIG.UI_DEPTH);
	}

	updateScore(score) {
		// Score tracking not used in Frogger
	}

	updateHighScore(score) {
		// High score tracking not used in Frogger
	}

	hideStartText() {
		if (this.startText) {
			this.startText.destroy();
			this.startText = null;
		}
	}

	resetScore() {
		// Score reset not used in Frogger
	}

	showGameOver(score) {
		return this.baseUI.showGameOver("Game Over!", score);
	}

	showWin(score) {
		return this.baseUI.showWin(score, "#ffff00");
	}

	clearEndGameUI() {
		this.baseUI.clearEndGameUI();
	}
}

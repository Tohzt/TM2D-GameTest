import { DINO_CONFIG } from "./config.js";
import { UIManager as BaseUIManager } from "../components/UIManager.js";

// Wrapper for Dino game that uses the shared UIManager
export class UIManager {
	constructor(scene) {
		this.scene = scene;
		// Use the shared UIManager with Dino-specific config
		this.baseUI = new BaseUIManager(scene, {
			gameId: "dino",
			fontSize: "28px",
			scoreX: 384,
			startMessage: "Tap to Start!\nAvoid the obstacles",
			startY: 250,
			uiDepth: DINO_CONFIG.UI_DEPTH,
		});
	}

	createGameUI() {
		this.baseUI.createGameUI();
	}

	updateScore(score) {
		this.baseUI.updateScore(score);
	}

	updateHighScore(score) {
		this.baseUI.updateHighScore(score);
	}

	hideStartText() {
		this.baseUI.hideStartText();
	}

	resetScore() {
		this.baseUI.resetScore();
	}

	showGameOver(score) {
		return this.baseUI.showGameOver("Game Over!", score);
	}

	clearEndGameUI() {
		this.baseUI.clearEndGameUI();
	}
}

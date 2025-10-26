import Phaser from "phaser";
import { DINO_CONFIG } from "./config.js";

export class ObstacleManager {
	constructor(scene) {
		this.scene = scene;
		this.obstacles = scene.add.group();
		this.spawnTimer = null;
		this.isSpawning = false;
	}

	startSpawning(scene) {
		this.isSpawning = true;
		this.spawnTimer = scene.time.addEvent({
			delay: DINO_CONFIG.OBSTACLE_SPAWN_DELAY,
			callback: () => this.spawnObstacle(),
			loop: true,
		});
	}

	spawnObstacle() {
		if (!this.isSpawning) return;

		const width = Phaser.Math.Between(
			DINO_CONFIG.OBSTACLE_MIN_WIDTH,
			DINO_CONFIG.OBSTACLE_MAX_WIDTH
		);
		const height = Phaser.Math.Between(
			DINO_CONFIG.OBSTACLE_MIN_HEIGHT,
			DINO_CONFIG.OBSTACLE_MAX_HEIGHT
		);

		const obstacle = this.scene.add.rectangle(
			DINO_CONFIG.OBSTACLE_SPAWN_X,
			DINO_CONFIG.GROUND_Y - DINO_CONFIG.GROUND_HEIGHT / 2 - height / 2,
			width,
			height,
			DINO_CONFIG.OBSTACLE_COLOR
		);
		obstacle.setDepth(DINO_CONFIG.OBSTACLE_DEPTH);

		this.scene.physics.add.existing(obstacle);
		obstacle.body.allowGravity = false;
		obstacle.body.setSize(width, height);

		// Set velocity after a small delay to ensure physics body is ready
		this.scene.time.delayedCall(10, () => {
			if (obstacle.body) {
				obstacle.body.setVelocityX(DINO_CONFIG.OBSTACLE_SPEED);
			}
		});

		this.obstacles.add(obstacle);
	}

	update(dinoCollision) {
		let scored = false;

		this.obstacles.children.entries.forEach((obstacle) => {
			if (obstacle.x < dinoCollision.x && !obstacle.scored) {
				obstacle.scored = true;
				scored = true;
			}

			if (obstacle.x < -50) {
				obstacle.destroy();
			}
		});

		return scored;
	}

	destroy() {
		if (this.spawnTimer) {
			this.spawnTimer.destroy();
		}
		this.obstacles.clear(true, true);
		this.isSpawning = false;
	}
}

import Phaser from "phaser";
import { FLAPPY_CONFIG } from "./config.js";

export class PipeManager {
	constructor(scene) {
		this.scene = scene;
		this.pipes = [];
		this.spawnTimer = null;
	}

	spawnPipes() {
		const gap = FLAPPY_CONFIG.PIPE_GAP;
		const gapPosition = Phaser.Math.Between(
			FLAPPY_CONFIG.PIPE_GAP_MIN,
			FLAPPY_CONFIG.PIPE_GAP_MAX
		);

		const topPipeY = gapPosition - gap / 2 - FLAPPY_CONFIG.PIPE_HEIGHT / 2;
		const topPipe = this.scene.add.rectangle(
			FLAPPY_CONFIG.PIPE_SPAWN_X,
			topPipeY,
			FLAPPY_CONFIG.PIPE_WIDTH,
			FLAPPY_CONFIG.PIPE_HEIGHT,
			FLAPPY_CONFIG.PIPE_COLOR
		);
		topPipe.setStrokeStyle(4, FLAPPY_CONFIG.PIPE_BORDER_COLOR);
		topPipe.originalY = topPipeY;
		this.pipes.push(topPipe);

		const bottomPipeY = gapPosition + gap / 2 + FLAPPY_CONFIG.PIPE_HEIGHT / 2;
		const bottomPipe = this.scene.add.rectangle(
			FLAPPY_CONFIG.PIPE_SPAWN_X,
			bottomPipeY,
			FLAPPY_CONFIG.PIPE_WIDTH,
			FLAPPY_CONFIG.PIPE_HEIGHT,
			FLAPPY_CONFIG.PIPE_COLOR
		);
		bottomPipe.setStrokeStyle(4, FLAPPY_CONFIG.PIPE_BORDER_COLOR);
		bottomPipe.originalY = bottomPipeY;
		this.pipes.push(bottomPipe);
	}

	update(bird) {
		let scored = false;

		this.pipes.forEach((pipe) => {
			// Move pipes to the left
			pipe.x += FLAPPY_CONFIG.PIPE_SPEED * (1 / 60); // Adjust for frame rate

			// Keep pipes at their original Y position (no falling!)
			if (pipe.originalY !== undefined) {
				pipe.y = pipe.originalY;
			}

			if (pipe.x < bird.x - 30 && !pipe.scored) {
				pipe.scored = true;
				if (pipe.y < 300) {
					scored = true;
				}
			}

			if (pipe.x < -100) {
				pipe.destroy();
				// Remove from array
				const index = this.pipes.indexOf(pipe);
				if (index > -1) {
					this.pipes.splice(index, 1);
				}
			}
		});

		return scored;
	}

	startSpawning(scene) {
		this.spawnTimer = scene.time.addEvent({
			delay: FLAPPY_CONFIG.PIPE_SPAWN_DELAY,
			callback: () => {
				this.spawnPipes();
			},
			loop: true,
		});
	}

	destroy() {
		if (this.spawnTimer) {
			this.spawnTimer.remove();
		}
		this.pipes.forEach((pipe) => pipe.destroy());
		this.pipes = [];
	}
}

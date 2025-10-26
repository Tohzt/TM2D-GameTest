import { FLAPPY_CONFIG } from "./config.js";

export class PipeManager {
	constructor(scene) {
		this.scene = scene;
		this.pipes = this.scene.physics.add.group();
		this.spawnTimer = null;
	}

	spawnPipes() {
		const gap = FLAPPY_CONFIG.PIPE_GAP;
		const gapPosition = Phaser.Math.Between(
			FLAPPY_CONFIG.PIPE_GAP_MIN,
			FLAPPY_CONFIG.PIPE_GAP_MAX
		);

		// Top pipe (green with darker border) - positioned above the gap
		const topPipeY = gapPosition - gap / 2 - FLAPPY_CONFIG.PIPE_HEIGHT / 2;
		const topPipe = this.scene.add.rectangle(
			FLAPPY_CONFIG.PIPE_SPAWN_X,
			topPipeY,
			FLAPPY_CONFIG.PIPE_WIDTH,
			FLAPPY_CONFIG.PIPE_HEIGHT,
			FLAPPY_CONFIG.PIPE_COLOR
		);
		this.scene.physics.add.existing(topPipe);
		topPipe.body.allowGravity = false;
		topPipe.setStrokeStyle(4, FLAPPY_CONFIG.PIPE_BORDER_COLOR);
		this.pipes.add(topPipe);

		// Set velocity after a small delay to ensure physics body is ready
		this.scene.time.delayedCall(10, () => {
			if (topPipe.body) {
				topPipe.body.setVelocityX(FLAPPY_CONFIG.PIPE_SPEED);
			}
		});

		// Bottom pipe (green with darker border) - positioned below the gap
		const bottomPipeY = gapPosition + gap / 2 + FLAPPY_CONFIG.PIPE_HEIGHT / 2;
		const bottomPipe = this.scene.add.rectangle(
			FLAPPY_CONFIG.PIPE_SPAWN_X,
			bottomPipeY,
			FLAPPY_CONFIG.PIPE_WIDTH,
			FLAPPY_CONFIG.PIPE_HEIGHT,
			FLAPPY_CONFIG.PIPE_COLOR
		);
		this.scene.physics.add.existing(bottomPipe);
		bottomPipe.body.allowGravity = false;
		bottomPipe.setStrokeStyle(4, FLAPPY_CONFIG.PIPE_BORDER_COLOR);
		this.pipes.add(bottomPipe);

		// Set velocity after a small delay to ensure physics body is ready
		this.scene.time.delayedCall(10, () => {
			if (bottomPipe.body) {
				bottomPipe.body.setVelocityX(FLAPPY_CONFIG.PIPE_SPEED);
			}
		});
	}

	update(bird) {
		let scored = false;

		this.pipes.children.entries.forEach((pipe) => {
			// Check if bird has safely passed through the pipe gap (scoring)
			// Add 30px offset so you only score when safely past the pipe
			if (pipe.x < bird.x - 30 && !pipe.scored) {
				pipe.scored = true;
				// Only score once per pipe pair (check if this is the top pipe)
				if (pipe.y < 300) {
					// Top pipe is above center
					scored = true;
				}
			}

			// Remove pipes that are off screen
			if (pipe.x < -100) {
				pipe.destroy();
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
		// Stop the spawn timer
		if (this.spawnTimer) {
			this.spawnTimer.remove();
		}
		// Clear all pipes
		this.pipes.clear(true, true);
		// Remove the group
		this.pipes.destroy();
	}
}

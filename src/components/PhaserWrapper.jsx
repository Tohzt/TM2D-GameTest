import { useEffect, useRef } from "react";
import * as Phaser from "phaser";

function PhaserWrapper({ gameConfig, onGameReady }) {
	const gameRef = useRef(null);
	const containerRef = useRef(null);

	useEffect(() => {
		// Don't create game if container isn't ready
		if (!containerRef.current) return;

		// Prevent double-mounting in development
		if (gameRef.current) return;

		// Convert string enums to Phaser constants
		const config = {
			type: Phaser.AUTO,
			...gameConfig,
			parent: containerRef.current,
		};

		if (typeof gameConfig.scale.mode === "string") {
			config.scale.mode = Phaser.Scale[gameConfig.scale.mode];
		}
		if (typeof gameConfig.scale.autoCenter === "string") {
			config.scale.autoCenter = Phaser.Scale[gameConfig.scale.autoCenter];
		}

		const game = new Phaser.Game(config);
		gameRef.current = game;

		// Optional callback when game is ready
		if (onGameReady) {
			onGameReady(game);
		}

		// CRITICAL: Cleanup function
		return () => {
			if (gameRef.current) {
				gameRef.current.destroy(true, false);
				gameRef.current = null;
			}
		};
	}, [gameConfig, onGameReady]); // Only recreate if config changes

	return (
		<div
			id="game-container"
			ref={containerRef}
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
			}}
		/>
	);
}

export default PhaserWrapper;

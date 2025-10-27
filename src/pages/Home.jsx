import { Link } from "react-router-dom";

const games = [
	{
		id: "catch",
		name: "Catch",
		description: "Catch falling objects!",
		color: "#9b59b6",
	},
	{
		id: "dino",
		name: "Dino Run",
		description: "Jump over obstacles!",
		color: "#ff6600",
	},
	{
		id: "flappy",
		name: "Flappy Bird",
		description: "Tap to fly!",
		color: "#4ec0ca",
	},
	{
		id: "frogger",
		name: "Frogger",
		description: "Cross the road!",
		color: "#228b22",
	},
	{
		id: "taps",
		name: "Don't Tap Red!",
		description: "Tap the sprites, avoid red!",
		color: "#ffff00",
	},
];

function Home() {
	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				height: "100vh",
				background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
				color: "white",
			}}
		>
			<div
				style={{
					padding: "20px 20px 10px 20px",
					textAlign: "center",
				}}
			>
				<h1 style={{ margin: 0, fontSize: "48px", fontWeight: "bold" }}>
					TM2D Games
				</h1>
			</div>

			<div
				style={{
					flex: 1,
					overflowY: "auto",
					padding: "20px",
					paddingTop: "10px",
				}}
			>
				<div
					style={{
						display: "grid",
						gap: "20px",
						maxWidth: "600px",
						margin: "0 auto",
						gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
					}}
				>
					{games.map((game) => (
						<Link
							key={game.id}
							to={`/game/${game.id}`}
							style={{
								padding: "30px 20px",
								background: "rgba(255, 255, 255, 0.2)",
								color: "white",
								textDecoration: "none",
								borderRadius: "15px",
								transition: "transform 0.2s",
								boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
								border: "2px solid rgba(255, 255, 255, 0.3)",
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.transform = "scale(1.05)";
								e.currentTarget.style.background = `rgba(255, 255, 255, 0.3)`;
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.transform = "scale(1)";
								e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
							}}
						>
							<h2 style={{ margin: "0 0 10px 0", fontSize: "24px" }}>
								{game.name}
							</h2>
							<p style={{ margin: 0, opacity: 0.9, fontSize: "14px" }}>
								{game.description}
							</p>
						</Link>
					))}
				</div>
			</div>
		</div>
	);
}

export default Home;

import { Link } from "react-router-dom";
import { useState } from "react";
import { Hamburger } from "lucide-react";
import GameLibrary from "../games/index.js";
import MenuDrawer from "../components/MenuDrawer.jsx";

const games = GameLibrary.map((game) => ({
	id: game.id,
	name: game.name,
	description: game.description,
	color: game.color,
}));

function Home() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
	const closeMenu = () => setIsMenuOpen(false);

	return (
		<div className="flex flex-col h-screen p-0 m-0 bg-gradient-to-b from-blue-500 to-purple-500 text-white relative overflow-hidden">
			<MenuDrawer isOpen={isMenuOpen} onClose={closeMenu} />

			<div className="flex flex-row items-center justify-end w-full p-2 bg-[#55556690]">
				<div className="w-full flex flex-row items-center justify-center">
					<h1 className="text-2xl font-bold">TooMuch2Do</h1>
				</div>
				<button
					onClick={toggleMenu}
					title="Open menu"
					aria-label="Open menu"
					className="p-2 rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
				>
					<Hamburger className="h-6 w-6 text-gray-300 hover:text-white" />
				</button>
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

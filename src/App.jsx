import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import GamePage from "./pages/GamePage";
import MyWallet from "./pages/MyWallet";

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/game/:gameId" element={<GamePage />} />
				<Route path="/my-wallet" element={<MyWallet />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;

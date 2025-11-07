import { Link } from "react-router-dom";
import { X } from "lucide-react";

function MenuDrawer({ isOpen, onClose }) {
	return (
		<>
			{/* Backdrop */}
			{isOpen && (
				<div
					className="fixed inset-0 bg-black/50 z-40 transition-opacity"
					onClick={onClose}
					style={{ touchAction: "none" }}
				/>
			)}

			{/* Drawer */}
			<div
				className={`fixed top-0 left-0 h-full w-80 bg-gradient-to-b from-purple-600 to-blue-600 z-50 transform transition-transform duration-300 ease-out shadow-2xl ${
					isOpen ? "translate-x-0" : "-translate-x-full"
				}`}
				style={{ touchAction: "pan-y" }}
			>
				<div className="flex flex-col h-full p-6">
					{/* Header */}
					<div className="flex items-center justify-between mb-8">
						<h2 className="text-2xl font-bold text-white">Menu</h2>
						<button
							onClick={onClose}
							className="p-2 rounded-lg hover:bg-white/20 transition-colors"
							aria-label="Close menu"
						>
							<X className="h-6 w-6 text-white" />
						</button>
					</div>

					{/* Menu Items */}
					<nav className="flex flex-col gap-2 flex-1">
						<Link
							to="/"
							onClick={onClose}
							className="px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white font-medium"
						>
							Home
						</Link>
						<Link
							to="/"
							onClick={onClose}
							className="px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white font-medium"
						>
							Games
						</Link>
						{/* Add more menu items here */}
						<div className="mt-auto pt-4 border-t border-white/20 flex flex-col gap-2">
							<button
								className="w-full px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white font-medium text-left"
								onClick={() => {}}
								aria-label="Connect wallet"
								title="Connect wallet"
							>
								Connect Wallet
							</button>
							<button
								className="w-full px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white font-medium text-left"
								onClick={() => {
									onClose();
									if (typeof WebApp !== "undefined") {
										WebApp.openMenu();
									}
								}}
								aria-label="Telegram menu"
								title="Telegram menu"
							>
								Telegram Menu
							</button>
						</div>
					</nav>
				</div>
			</div>
		</>
	);
}

export default MenuDrawer;

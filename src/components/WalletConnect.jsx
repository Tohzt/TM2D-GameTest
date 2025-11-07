import { TonConnectButton, useTonAddress } from "@tonconnect/ui-react";
import { useEffect, useState } from "react";
import WebApp from "@twa-dev/sdk";

function WalletConnect() {
	const userFriendlyAddress = useTonAddress();
	const rawAddress = useTonAddress(false); // Raw format for backend

	const [saving, setSaving] = useState(false);
	const [saved, setSaved] = useState(false);

	useEffect(() => {
		if (rawAddress) {
			saveWalletToBackend(rawAddress);
		}
	}, [rawAddress]);

	const saveWalletToBackend = async (walletAddress) => {
		try {
			setSaving(true);
			const response = await fetch("https://api.tm2d-games.online/api/wallet", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					initData: WebApp.initData,
					walletAddress,
				}),
			});

			if (response.ok) {
				console.log("Wallet saved to database");
				setSaved(true);
			}
		} catch (error) {
			console.error("Failed to save wallet:", error);
		} finally {
			setSaving(false);
		}
	};

	return (
		<div>
			<TonConnectButton
				className="w-full"
				style={{
					width: "100%",
					padding: 0,
					margin: 0,
					background: "transparent",
					border: "none",
					color: "inherit",
					fontWeight: "inherit",
					textAlign: "inherit",
					borderRadius: 0,
					boxShadow: "none",
					display: "flex",
					alignItems: "center",
					justifyContent: "flex-start",
					cursor: "pointer",
				}}
			/>

			{userFriendlyAddress && (
				<div>
					<p className="text-white text-sm opacity-80">Connected Wallet</p>
					<p
						style={{
							margin: "5px 0 0 0",
							fontFamily: "monospace",
							fontSize: "12px",
						}}
					>
						{userFriendlyAddress.slice(0, 8)}...{userFriendlyAddress.slice(-6)}
					</p>
					{saving && (
						<p style={{ margin: "5px 0 0 0", fontSize: "12px" }}>Saving...</p>
					)}
					{saved && (
						<p
							style={{
								margin: "5px 0 0 0",
								fontSize: "12px",
								color: "#4ade80",
							}}
						>
							✓ Saved
						</p>
					)}
				</div>
			)}
		</div>
	);
}

export default WalletConnect;

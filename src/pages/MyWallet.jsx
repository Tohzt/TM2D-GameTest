import { useTonWallet, useTonAddress } from "@tonconnect/ui-react";
import { Link } from "react-router-dom";
import { ArrowLeft, Copy, Check } from "lucide-react";
import { useState, useEffect } from "react";

function MyWallet() {
	const wallet = useTonWallet();
	const userFriendlyAddress = useTonAddress();
	const rawAddress = useTonAddress(false);
	const [copied, setCopied] = useState(false);
	const [nfts, setNfts] = useState([]);
	const [loadingNfts, setLoadingNfts] = useState(false);
	const [nftError, setNftError] = useState(null);

	useEffect(() => {
		if (rawAddress) {
			fetchNFTs(rawAddress);
		}
	}, [rawAddress]);

	const fetchNFTs = async (address) => {
		if (!address) return;

		setLoadingNfts(true);
		setNftError(null);
		try {
			// Using TON API to fetch NFTs
			// Remove ':' from address if present (user-friendly format)
			const cleanAddress = address.replace(/:/g, "");

			const response = await fetch(
				`https://tonapi.io/v2/accounts/${cleanAddress}/nfts?limit=1000`,
				{
					headers: {
						Accept: "application/json",
					},
				}
			);

			if (response.ok) {
				const data = await response.json();
				setNfts(data.nft_items || []);
			} else {
				const errorText = await response.text();
				console.error("NFT API error:", response.status, errorText);
				setNftError("Failed to fetch NFTs");
			}
		} catch (error) {
			console.error("Error fetching NFTs:", error);
			setNftError("Error loading NFTs");
		} finally {
			setLoadingNfts(false);
		}
	};

	const copyAddress = () => {
		if (userFriendlyAddress) {
			navigator.clipboard.writeText(userFriendlyAddress);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
	};

	if (!wallet) {
		return (
			<div className="flex flex-col h-screen p-0 m-0 bg-gradient-to-b from-blue-500 to-purple-500 text-white">
				<div className="flex flex-row items-center w-full p-4 bg-[#55556690]">
					<Link
						to="/"
						className="p-2 rounded-lg hover:bg-white/20 transition-colors mr-2"
					>
						<ArrowLeft className="h-6 w-6 text-white" />
					</Link>
					<h1 className="text-2xl font-bold">My Wallet</h1>
				</div>
				<div className="flex-1 flex items-center justify-center p-6">
					<div className="text-center">
						<p className="text-xl mb-4">No wallet connected</p>
						<p className="text-white/80 mb-6">
							Connect your wallet from the menu to view wallet information.
						</p>
						<Link
							to="/"
							className="inline-block px-6 py-3 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-white font-medium"
						>
							Go to Home
						</Link>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-screen p-0 m-0 bg-gradient-to-b from-blue-500 to-purple-500 text-white">
			{/* Header */}
			<div className="flex flex-row items-center w-full p-4 bg-[#55556690]">
				<Link
					to="/"
					className="p-2 rounded-lg hover:bg-white/20 transition-colors mr-2"
				>
					<ArrowLeft className="h-6 w-6 text-white" />
				</Link>
				<h1 className="text-2xl font-bold">My Wallet</h1>
			</div>

			{/* Content */}
			<div
				style={{
					flex: 1,
					overflowY: "auto",
					padding: "20px",
				}}
			>
				<div
					style={{
						maxWidth: "600px",
						margin: "0 auto",
					}}
				>
					{/* Wallet Address Card */}
					<div
						style={{
							padding: "24px",
							background: "rgba(255, 255, 255, 0.2)",
							borderRadius: "15px",
							marginBottom: "20px",
							border: "2px solid rgba(255, 255, 255, 0.3)",
						}}
					>
						<h2
							style={{
								margin: "0 0 16px 0",
								fontSize: "18px",
								fontWeight: "600",
								opacity: 0.9,
							}}
						>
							Wallet Address
						</h2>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								gap: "12px",
								marginBottom: "8px",
							}}
						>
							<code
								style={{
									flex: 1,
									fontFamily: "monospace",
									fontSize: "14px",
									wordBreak: "break-all",
									background: "rgba(0, 0, 0, 0.2)",
									padding: "12px",
									borderRadius: "8px",
								}}
							>
								{userFriendlyAddress || rawAddress}
							</code>
							<button
								onClick={copyAddress}
								className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
								title="Copy address"
							>
								{copied ? (
									<Check className="h-5 w-5 text-green-400" />
								) : (
									<Copy className="h-5 w-5 text-white" />
								)}
							</button>
						</div>
						{rawAddress && rawAddress !== userFriendlyAddress && (
							<div style={{ marginTop: "12px" }}>
								<p
									style={{
										margin: "0 0 8px 0",
										fontSize: "12px",
										opacity: 0.7,
									}}
								>
									Raw Address:
								</p>
								<code
									style={{
										display: "block",
										fontFamily: "monospace",
										fontSize: "12px",
										wordBreak: "break-all",
										background: "rgba(0, 0, 0, 0.2)",
										padding: "8px",
										borderRadius: "6px",
										opacity: 0.8,
									}}
								>
									{rawAddress}
								</code>
							</div>
						)}
					</div>

					{/* Wallet Info Card */}
					<div
						style={{
							padding: "24px",
							background: "rgba(255, 255, 255, 0.2)",
							borderRadius: "15px",
							marginBottom: "20px",
							border: "2px solid rgba(255, 255, 255, 0.3)",
						}}
					>
						<h2
							style={{
								margin: "0 0 16px 0",
								fontSize: "18px",
								fontWeight: "600",
								opacity: 0.9,
							}}
						>
							Wallet Information
						</h2>
						<div
							style={{ display: "flex", flexDirection: "column", gap: "12px" }}
						>
							{wallet.device && (
								<div>
									<p
										style={{
											margin: "0 0 4px 0",
											fontSize: "12px",
											opacity: 0.7,
										}}
									>
										Wallet App:
									</p>
									<p style={{ margin: 0, fontSize: "16px", fontWeight: "500" }}>
										{wallet.device.appName || "Unknown"}
									</p>
								</div>
							)}
							{wallet.account && (
								<div>
									<p
										style={{
											margin: "0 0 4px 0",
											fontSize: "12px",
											opacity: 0.7,
										}}
									>
										Chain:
									</p>
									<p style={{ margin: 0, fontSize: "16px", fontWeight: "500" }}>
										{wallet.account.chain || "Unknown"}
									</p>
								</div>
							)}
							{wallet.provider && (
								<div>
									<p
										style={{
											margin: "0 0 4px 0",
											fontSize: "12px",
											opacity: 0.7,
										}}
									>
										Provider:
									</p>
									<p style={{ margin: 0, fontSize: "16px", fontWeight: "500" }}>
										{wallet.provider}
									</p>
								</div>
							)}
						</div>
					</div>

					{/* NFTs Card */}
					<div
						style={{
							padding: "24px",
							background: "rgba(255, 255, 255, 0.2)",
							borderRadius: "15px",
							marginBottom: "20px",
							border: "2px solid rgba(255, 255, 255, 0.3)",
						}}
					>
						<h2
							style={{
								margin: "0 0 16px 0",
								fontSize: "18px",
								fontWeight: "600",
								opacity: 0.9,
							}}
						>
							NFTs ({nfts.length})
						</h2>
						{loadingNfts ? (
							<p style={{ opacity: 0.7, textAlign: "center", padding: "20px" }}>
								Loading NFTs...
							</p>
						) : nftError ? (
							<p
								style={{
									opacity: 0.7,
									color: "#ff6b6b",
									textAlign: "center",
									padding: "20px",
								}}
							>
								{nftError}
							</p>
						) : nfts.length === 0 ? (
							<p style={{ opacity: 0.7, textAlign: "center", padding: "20px" }}>
								No NFTs found in this wallet
							</p>
						) : (
							<div
								style={{
									display: "grid",
									gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
									gap: "16px",
								}}
							>
								{nfts.map((nft, index) => {
									const imageUrl =
										nft.metadata?.image ||
										nft.previews?.[0]?.url ||
										nft.previews?.[nft.previews.length - 1]?.url;
									const name = nft.metadata?.name || `NFT #${index + 1}`;
									const description = nft.metadata?.description || "";

									return (
										<div
											key={nft.address || index}
											style={{
												background: "rgba(0, 0, 0, 0.2)",
												borderRadius: "12px",
												overflow: "hidden",
												border: "1px solid rgba(255, 255, 255, 0.2)",
												transition: "transform 0.2s",
												cursor: "pointer",
											}}
											onMouseEnter={(e) => {
												e.currentTarget.style.transform = "scale(1.05)";
											}}
											onMouseLeave={(e) => {
												e.currentTarget.style.transform = "scale(1)";
											}}
										>
											{imageUrl ? (
												<img
													src={imageUrl}
													alt={name}
													style={{
														width: "100%",
														height: "150px",
														objectFit: "cover",
														background: "rgba(0, 0, 0, 0.3)",
													}}
													onError={(e) => {
														e.target.style.display = "none";
													}}
												/>
											) : (
												<div
													style={{
														width: "100%",
														height: "150px",
														background: "rgba(0, 0, 0, 0.3)",
														display: "flex",
														alignItems: "center",
														justifyContent: "center",
														fontSize: "12px",
														opacity: 0.5,
													}}
												>
													No Image
												</div>
											)}
											<div style={{ padding: "12px" }}>
												<p
													style={{
														margin: "0 0 4px 0",
														fontSize: "14px",
														fontWeight: "500",
														overflow: "hidden",
														textOverflow: "ellipsis",
														whiteSpace: "nowrap",
													}}
													title={name}
												>
													{name}
												</p>
												{description && (
													<p
														style={{
															margin: 0,
															fontSize: "11px",
															opacity: 0.7,
															overflow: "hidden",
															textOverflow: "ellipsis",
															whiteSpace: "nowrap",
														}}
														title={description}
													>
														{description}
													</p>
												)}
											</div>
										</div>
									);
								})}
							</div>
						)}
					</div>

					{/* Raw Wallet Data (for debugging) */}
					<details
						style={{
							padding: "16px",
							background: "rgba(0, 0, 0, 0.2)",
							borderRadius: "10px",
							cursor: "pointer",
						}}
					>
						<summary
							style={{
								fontSize: "14px",
								opacity: 0.8,
								marginBottom: "8px",
							}}
						>
							View Raw Wallet Data
						</summary>
						<pre
							style={{
								fontSize: "11px",
								fontFamily: "monospace",
								overflow: "auto",
								background: "rgba(0, 0, 0, 0.3)",
								padding: "12px",
								borderRadius: "6px",
								margin: 0,
								whiteSpace: "pre-wrap",
								wordBreak: "break-all",
							}}
						>
							{JSON.stringify(wallet, null, 2)}
						</pre>
					</details>
				</div>
			</div>
		</div>
	);
}

export default MyWallet;

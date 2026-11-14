"use client";

export default function HomePage() {
  // These are the products from your earlier list, organized by category
  const categories = [
    {
      title: "🔒 Lock Plans",
      description: "Withdraw after lock days",
      products: ["LipaVault", "LipaCore", "LipaShield", "LipaControl", "LipaCredit", "LipaDirect", "LipaOmni", "LipaAdmin"]
    },
    {
      title: "📈 Daily Payouts",
      description: "Earn daily, expires after days",
      products: ["LipaFlow", "LipaPulse", "LipaRewards", "LipaSub", "LipaSpend", "LipaSplit", "LipaPaylink", "LipaInvoice", "LipaInsights"]
    },
    {
      title: "⚡ 24H Unlock",
      description: "Starts earning & unlocks after 24hrs",
      products: ["LipaTap", "LipaScan", "LipaGo", "LipaPocket", "LipaWallet", "LipaP2P", "LipaSoftPOS", "LipaTerminal", "LipaCheckout", "LipaRegister", "LipaVirtual", "LipaGateway", "LipaBridge", "LipaConnect", "LipaDashboard", "LipaSDK", "LipaX", "LipaLedger"]
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-green-500">LIPA Technologies</h1>
        <p className="text-gray-400 text-sm">Choose a product to start earning</p>
      </div>

      {/* Categories Loop */}
      {categories.map((category, index) => (
        <div key={index} className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-white">{category.title}</h2>
            <p className="text-xs text-gray-500">{category.description}</p>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 gap-3">
            {category.products.map((product) => (
              <div 
                key={product} 
                className="bg-gray-800 border border-gray-700 p-4 rounded-xl flex flex-col items-center justify-center text-center hover:border-green-500 transition cursor-pointer"
              >
                <span className="font-medium text-sm">{product}</span>
                <span className="text-xs text-green-400 mt-1">View Plan</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

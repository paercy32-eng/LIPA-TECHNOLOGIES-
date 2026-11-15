const handlePurchase = async (product: any) => {
  if (isProcessing) return;
  if (purchasedIds.includes(product.id)) return;

  setIsProcessing(true);

  try {
    // 1. Fetch the FRESHEST balance from the database to avoid stale state issues
    const { data: currentBalData } = await supabase.from("balances").select("available").eq("user_id", userId).single();
    const currentBalance = Number(currentBalData?.available || 0);

    if (currentBalance < product.price) {
      setIsProcessing(false);
      return alert(`Insufficient balance. You need UGX ${product.price.toLocaleString()}. You currently have UGX ${currentBalance.toLocaleString()}.`);
    }

    // 2. FIRST PURCHASE RULE
    const { count: invCount } = await supabase
      .from("investments")
      .select("*", { count: 'exact', head: true })
      .eq("user_id", userId);

    if (invCount === 0) {
      const { data: deposits } = await supabase
        .from("transactions")
        .select("amount")
        .eq("user_id", userId)
        .eq("type", "DEPOSIT")
        .eq("status", "COMPLETED");

      const totalDeposited = deposits?.reduce((sum, tx) => sum + Number(tx.amount), 0) || 0;

      if (totalDeposited < product.price) {
        setIsProcessing(false);
        return alert(`First Purchase Rule: Your first purchase must be fully funded by approved deposits. You have deposited UGX ${totalDeposited.toLocaleString()}.`);
      }
    }

    // 3. Deduct Balance
    const newBalance = currentBalance - product.price;
    const { error: balError } = await supabase.from("balances").update({ available: newBalance }).eq("user_id", userId);
    if (balError) throw balError;

    // 4. Create Investment Record
    const { error: invError } = await supabase.from("investments").insert({
      user_id: userId,
      product_id: product.id,
      amount: product.price,
      expected_return: product.total,
      status: "ACTIVE",
    });
    if (invError) throw invError;

    // 5. Update UI
    setBalance(newBalance);
    setPurchasedIds([...purchasedIds, product.id]);
    alert(`Successfully purchased ${product.name}! Check your Income tab.`);

  } catch (error: any) {
    alert("Purchase failed: " + error.message);
  } finally {
    setIsProcessing(false);
  }
};

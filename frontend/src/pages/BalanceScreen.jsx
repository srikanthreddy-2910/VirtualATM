import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ATMScreen from "../components/ATMScreen";
import ATMMachine from "../components/ATMMachine";
import { ArrowLeft, Eye, EyeOff, TrendingUp, TrendingDown } from "lucide-react";
import { getBalance } from "../api/account.api";

const recentTransactions = [
  {
    id: 1,
    type: "credit",
    desc: "Salary Credit",
    amount: 50000,
    date: "05 Jan",
  },
  {
    id: 2,
    type: "debit",
    desc: "ATM Withdrawal",
    amount: 5000,
    date: "04 Jan",
  },
  {
    id: 3,
    type: "debit",
    desc: "Online Shopping",
    amount: 2499,
    date: "03 Jan",
  },
  { id: 4, type: "credit", desc: "Refund", amount: 799, date: "02 Jan" },
  { id: 5, type: "debit", desc: "Bill Payment", amount: 1200, date: "01 Jan" },
];

export default function BalanceScreen() {
  const [showBalance, setShowBalance] = useState(true);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const authenticated = sessionStorage.getItem("authenticated");
    const accountId = sessionStorage.getItem("accountId");

    if (!authenticated || !accountId) {
      window.location.href = "/";
      return;
    }

    async function fetchBalance() {
      try {
        const res = await getBalance(accountId);
        setBalance(res.data.data.balance);
      } catch (err) {
        console.error("Balance fetch failed", err);
        window.location.href = "/tx-failure";
      } finally {
        setLoading(false);
      }
    }

    fetchBalance();
  }, []);

  return (
    <ATMMachine>
      <ATMScreen title="BALANCE ENQUIRY">
        <div className="flex flex-col">
          <button
            onClick={() => (window.location.href = "/menu")}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Menu</span>
          </button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 rounded-xl p-6 mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">Available Balance</p>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="p-2 rounded-lg hover:bg-primary/10 transition-colors"
              >
                {showBalance ? (
                  <EyeOff className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <Eye className="w-5 h-5 text-muted-foreground" />
                )}
              </button>
            </div>

            <motion.p
              key={showBalance ? "visible" : "hidden"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-4xl font-display text-primary text-glow"
            >
              {loading
                ? "Loading..."
                : showBalance
                ? `₹${Number(balance).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}`
                : "₹••,•••.••"}
            </motion.p>
          </motion.div>
        </div>
      </ATMScreen>
    </ATMMachine>
  );
}

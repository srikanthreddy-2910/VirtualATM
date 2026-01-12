import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ATMScreen from "../components/ATMScreen";
import ATMMachine from "../components/ATMMachine";
import ATMKeypad from "../components/ATMKeypad";
import { ArrowLeft, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { transferFunds } from "../api/transaction.api";

export default function TransferScreen() {
  const [stage, setStage] = useState("account");

  const [toAccount, setToAccount] = useState("");
  const [amount, setAmount] = useState("");
  const navigate = useNavigate();

  const fromAccount = sessionStorage.getItem("accountNo");

  const isValidAccount = /^\d{16}$/.test(toAccount);

  const handleAccountDigit = (d) => {
    if (toAccount.length < 18) setToAccount((p) => p + d);
  };

  const handleAmountDigit = (d) => {
    if (amount.length < 7) setAmount((p) => p + d);
  };

  const clearAccount = () => setToAccount("");
  const clearAmount = () => setAmount("");

  const handleConfirm = async () => {
    try {
      if (!isValidAccount) {
        alert("Recipient account number must be 16 digits");
        return;
      }

      if (Number(amount) <= 0) {
        alert("Enter valid amount");
        return;
      }

      if (toAccount === fromAccount) {
        alert("Cannot transfer to your own account");
        return;
      }

      setStage("processing");

      await transferFunds({
        fromAccountNo: fromAccount,
        toAccountNo: toAccount,
        amount: Number(amount),
      });
      console.log("Transfer successful");

      setStage("complete");
    } catch (err) {
      console.error("Transfer failed:", err);
      navigate("/tx-failure", {
        state: {
          message: err.response?.data?.message || "Transfer failed",
          from: "transfer",
        },
      });
    }
  };

  return (
    <ATMMachine>
      <ATMScreen title="FUND TRANSFER">
        <AnimatePresence mode="wait">
          {stage === "account" && (
            <motion.div
              key="account"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col "
            >
              <button
                onClick={() => (window.location.href = "/menu")}
                className="flex items-center gap-2 text-muted-foreground hover:text-primary mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Menu
              </button>

              <p className="text-primary mb-2 self-center">
                Enter Recipient Account
              </p>

              <div className="relative flex justify-center mb-4 ">
                <input
                  type="text"
                  value={toAccount}
                  readOnly
                  placeholder="••••••••••"
                  className="w-[260px] bg-atm-screen border-2 border-primary/40 rounded-lg px-4 py-3 
          text-center font-mono text-lg tracking-[0.2em] text-primary
          focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-3 gap-2 w-[260px] self-center">
                {[
                  "1",
                  "2",
                  "3",
                  "4",
                  "5",
                  "6",
                  "7",
                  "8",
                  "9",
                  "C",
                  "0",
                  "⌫",
                ].map((key) => (
                  <motion.button
                    key={key}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      if (key === "C") setToAccount("");
                      else if (key === "⌫") setToAccount((p) => p.slice(0, -1));
                      else if (toAccount.length < 16)
                        setToAccount((p) => p + key);
                    }}
                    className={`h-[42px] rounded-lg font-bold text-xl
            ${
              key === "⌫"
                ? "bg-primary text-white"
                : key === "C"
                ? "bg-red-600 text-white"
                : "bg-atm-button text-white"
            }`}
                  >
                    {key}
                  </motion.button>
                ))}
              </div>

              <button
                disabled={!isValidAccount}
                onClick={() => setStage("amount")}
                className="w-[260px] mt-4 py-3 bg-primary rounded text-white self-center disabled:opacity-40"
              >
                CONTINUE
              </button>
            </motion.div>
          )}

          {stage === "amount" && (
            <motion.div key="amount" className="flex flex-col">
              <button
                onClick={() => {
                  if (amount.length > 0) {
                    setAmount((prev) => prev.slice(0, -1));
                  } else {
                    setStage("account");
                  }
                }}
                className="flex items-center gap-2 text-muted-foreground hover:text-primary mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

              <p className="text-xs text-muted-foreground mb-2 uppercase">
                Enter Amount
              </p>

              <div className="relative mb-4">
                <span className="absolute left-4 text-primary text-xl">₹</span>
                <input
                  type="text"
                  value={amount}
                  readOnly
                  className="w-full bg-input border border-primary/30 rounded-lg
          pl-10 pr-4 py-4 text-center font-mono text-2xl"
                />
              </div>

              <ATMKeypad
                onDigit={(d) => amount.length < 6 && setAmount((p) => p + d)}
                onBackspace={() => setAmount("")}
                onEnter={() => {
                  if (Number(amount) > 0) setStage("confirm");
                }}
              />
            </motion.div>
          )}

          {stage === "confirm" && (
            <motion.div
              key="confirm"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
            >
              <p className="text-muted-foreground">Transfer</p>
              <p className="text-xl text-primary mb-2">₹{amount}</p>
              <p className="text-sm text-muted-foreground mb-6">
                To Account {toAccount}
              </p>

              <div className="flex gap-4">
                <button
                  onClick={() => setStage("amount")}
                  className="flex-1 bg-muted py-3 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 bg-primary py-3 rounded text-primary-foreground"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          )}

          {stage === "processing" && (
            <motion.div
              key="processing"
              className="flex flex-col items-center justify-center h-full"
            >
              <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
              <p className="text-primary">Processing Transfer…</p>
            </motion.div>
          )}

          {stage === "complete" && (
            <motion.div
              key="complete"
              className="flex flex-col items-center justify-center h-full"
            >
              <div className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center mb-4">
                <Check className="w-10 h-10 text-primary" />
              </div>
              <p className="text-primary text-xl mb-2">Transfer Successful</p>
              <p className="text-muted-foreground mb-6">₹{amount} sent</p>

              <div className="flex gap-4">
                <button
                  onClick={() => (window.location.href = "/menu")}
                  className="px-6 py-3 bg-primary rounded text-primary-foreground"
                >
                  Main Menu
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </ATMScreen>
    </ATMMachine>
  );
}

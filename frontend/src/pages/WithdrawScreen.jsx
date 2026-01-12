import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ATMScreen from "../components/ATMScreen";
import ATMMachine from "../components/ATMMachine";
import ATMKeypad from "../components/ATMKeypad";
import { ArrowLeft, Check } from "lucide-react";
import { withdrawCash } from "../api/transaction.api";
import { useNavigate } from "react-router-dom";

const quickAmounts = [500, 1000, 2000, 5000, 10000, 20000];

export default function WithdrawScreen() {
  const [amount, setAmount] = useState("");
  const [stage, setStage] = useState("select");
  const [cashNotes, setCashNotes] = useState([]);
  const navigate = useNavigate();

  const cardId = sessionStorage.getItem("cardId");
  const accountId = sessionStorage.getItem("accountId");
  const machineId = sessionStorage.getItem("machineId");

  useEffect(() => {
    const authenticated = sessionStorage.getItem("authenticated");
    if (!authenticated) {
      window.location.href = "/";
    }
  }, []);

  const handleQuickAmount = (value) => {
    setAmount(value.toString());
    setStage("confirm");
  };

  const handleKeyPress = (key) => {
    if (key === "CLEAR") {
      setAmount("");
    } else if (key === "ENTER" && amount) {
      setStage("confirm");
    } else if (amount.length < 6) {
      setAmount((prev) => prev + key);
    }
  };

  const handleConfirm = async () => {
    try {
      setStage("processing");

      const res = await withdrawCash({
        cardId,
        accountId,
        machineId,
        amount: Number(amount),
      });

      const denominations = res.data.data.denominations;

      console.log("hi1");

      const total = parseInt(amount);
      const notes = [];

      Object.entries(denominations).forEach(([value, count]) => {
        for (let i = 0; i < count; i++) {
          notes.push(Number(value));
        }
      });

      setCashNotes(notes);
      setStage("dispensing");

      setTimeout(() => {
        setStage("complete");
      }, 3000);
      console.log("hi2");
    } catch (err) {
      console.log("hi3");

      console.log("ATM ERROR:", err.response?.data);

      const message =
        err.response?.data?.message || err.message || "Transaction failed";

      navigate("/tx-failure", {
        state: {
          message,
          from: "withdraw",
        },
      });
    }
  };

  return (
    <ATMMachine>
      <ATMScreen title="CASH WITHDRAWAL">
        <AnimatePresence mode="wait">
          {stage === "select" && (
            <motion.div
              key="select"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col"
            >
              <button
                onClick={() => (window.location.href = "/menu")}
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Back to Menu</span>
              </button>

              <p className="text-xs text-muted-foreground mb-3 tracking-wider uppercase">
                Quick Select
              </p>
              <div className="grid grid-cols-3 gap-2 mb-6">
                {quickAmounts.map((value) => (
                  <motion.button
                    key={value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleQuickAmount(value)}
                    className="py-3 rounded-lg bg-muted/20 border border-primary/20 
                             hover:bg-primary/10 hover:border-primary/40 transition-all
                             text-foreground font-semibold"
                  >
                    ₹{value.toLocaleString()}
                  </motion.button>
                ))}
              </div>

              <p className="text-xs text-muted-foreground mb-2 tracking-wider uppercase">
                Or Enter Amount
              </p>
              <div className="relative flex  mb-4">
                <span className="absolute left-4 text-primary text-xl">₹</span>

                <input
                  type="text"
                  value={amount}
                  readOnly
                  placeholder="0"
                  className="
      w-full bg-input border border-primary/30 rounded-lg
      pl-10 pr-4 py-4
      text-center font-mono text-2xl text-foreground
      tracking-widest
      focus:outline-none focus:border-primary
    "
                />
              </div>

              <ATMKeypad
                onDigit={(d) => handleKeyPress(d)}
                onBackspace={() => handleKeyPress("CLEAR")}
                onEnter={() => handleKeyPress("ENTER")}
              />
            </motion.div>
          )}

          {stage === "confirm" && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center justify-center h-full"
            >
              <p className="text-muted-foreground mb-2">You are withdrawing</p>
              <p className="text-4xl font-display text-primary text-glow mb-8">
                ₹{parseInt(amount).toLocaleString()}
              </p>

              <div className="flex gap-4 w-full">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setStage("select")}
                  className="flex-1 py-4 rounded-lg bg-muted border border-muted-foreground/30 
                           text-foreground font-semibold"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleConfirm}
                  className="flex-1 py-4 rounded-lg bg-primary text-primary-foreground 
                           font-semibold"
                >
                  Confirm
                </motion.button>
              </div>
            </motion.div>
          )}

          {stage === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-full"
            >
              <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-6" />
              <p className="text-primary text-glow text-lg">
                Processing Transaction
              </p>
              <p className="text-muted-foreground text-sm mt-2">
                Please wait...
              </p>
            </motion.div>
          )}

          {stage === "dispensing" && (
            <motion.div
              key="dispensing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-full"
            >
              <p className="text-secondary text-glow-amber text-lg mb-6">
                Dispensing Cash
              </p>

              <div className="relative h-32 w-full flex justify-center items-end overflow-hidden">
                {cashNotes.slice(0, 5).map((note, i) => (
                  <motion.div
                    key={i}
                    initial={{
                      y: -100,
                      opacity: 0,
                      rotate: -5 + Math.random() * 10,
                    }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: i * 0.2, duration: 0.5 }}
                    className="absolute w-32 h-16 rounded-md bg-gradient-to-r from-green-700 to-green-600 
                             border border-green-500/50 shadow-lg flex items-center justify-center"
                    style={{
                      transform: `translateX(${(i - 2) * 10}px) rotate(${
                        -5 + i * 2
                      }deg)`,
                    }}
                  >
                    <span className="text-white font-bold">₹{note}</span>
                  </motion.div>
                ))}
              </div>

              <p className="text-muted-foreground text-sm mt-4">
                Please collect your cash
              </p>
            </motion.div>
          )}

          {stage === "complete" && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center h-full"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary 
                         flex items-center justify-center mb-6"
              >
                <Check className="w-10 h-10 text-primary" />
              </motion.div>

              <p className="text-primary text-glow text-xl mb-2">
                Transaction Complete
              </p>
              <p className="text-muted-foreground text-sm mb-8">
                ₹{parseInt(amount).toLocaleString()} withdrawn successfully
              </p>

              <div className="flex gap-4">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setAmount("");
                    setStage("select");
                  }}
                  className="px-6 py-3 rounded-lg bg-muted border border-primary/30 text-foreground"
                >
                  Another Transaction
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => (window.location.href = "/menu")}
                  className="px-6 py-3 rounded-lg bg-primary text-primary-foreground"
                >
                  Main Menu
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </ATMScreen>
    </ATMMachine>
  );
}

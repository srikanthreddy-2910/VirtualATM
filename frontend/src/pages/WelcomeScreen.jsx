import { useState } from "react";
import { motion } from "framer-motion";
import ATMScreen from "../components/ATMScreen";
import ATMCardSlot from "../components/ATMCardSlot";
import ATMMachine from "../components/ATMMachine";
import { insertCard } from "../api/atm.api";

const Bank = "Crypto Bank";

export default function WelcomeScreen() {
  const [cardNumber, setCardNumber] = useState("");
  const [isInserted, setIsInserted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const MACHINE_ID = 1;

  const handleInsertCard = async () => {
    if (cardNumber.length !== 16) return;

    try {
      setIsLoading(true);

      const res = await insertCard(cardNumber, MACHINE_ID);
      
      console.log("insertCard res", res);
      if (res.data.success) {
        const { cardId } = res.data.data;

        sessionStorage.setItem("cardNumber", cardNumber);
        sessionStorage.setItem("cardId", cardId);
        sessionStorage.setItem("machineId", MACHINE_ID);

        setIsInserted(true);
        await new Promise((r) => setTimeout(r, 1500));

        window.location.href = "/pin";
      }
    } catch (err) {
      alert(err.response?.data?.message || "Card rejected. Try another card.");
      setIsInserted(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ATMMachine>
      <ATMScreen title={Bank}>
        <div className="flex flex-col items-center w-full h-full justify-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-4"
          >
            <p className="text-primary text-glow text-xl font-bold">Welcome</p>
            <p className="text-muted-foreground text-sm mt-1">
              Please insert your ATM card to begin
            </p>
          </motion.div>

          <ATMCardSlot
            cardNumber={cardNumber}
            isInserted={isInserted}
            isLoading={isLoading}
          />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="w-full mt-6"
          >
            <label className="block text-xs text-primary mb-2 tracking-wider uppercase text-center font-bold">
              Enter Card Number
            </label>
            <div className="relative flex justify-center">
              <input
                type="text"
                value={cardNumber}
                onChange={(e) =>
                  setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16))
                }
                placeholder="•••• •••• •••• ••••"
                disabled={isLoading || isInserted}
                className="w-[260px] bg-atm-screen border-2 border-primary/40 rounded-lg px-4 py-3 
                         text-center font-mono text-lg tracking-[0.2em] text-primary
                         placeholder:text-muted-foreground/50
                         focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30
                         disabled:opacity-50 disabled:cursor-not-allowed
                         shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-3 gap-2 mt-4"
            style={{ width: "260px" }}
          >
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "⌫"].map(
              (key) => (
                <motion.button
                  key={key}
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => {
                    if (isLoading || isInserted) return;

                    if (key === "C") {
                      setCardNumber("");
                    } else if (key === "⌫") {
                      setCardNumber((prev) => prev.slice(0, -1));
                    } else {
                      if (cardNumber.length < 16) {
                        setCardNumber((prev) => prev + key);
                      }
                    }
                  }}
                  disabled={isLoading || isInserted}
                  className={`
                     + h-[24px] sm:h-[24px] rounded-lg  font-bold text-xl tracking-widest
                    transition-all duration-150 atm-button-3d 
                    border border-atm-metal/30
                    ${
                      key === "⌫"
                        ? "bg-gradient-to-b from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/30"
                        : key === "C"
                        ? "bg-gradient-to-b from-destructive to-destructive/80 text-destructive-foreground shadow-lg shadow-destructive/30"
                        : "bg-gradient-to-b from-atm-button to-atm-button-active text-foreground"
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  {key}
                </motion.button>
              )
            )}
          </motion.div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: cardNumber.length === 16 ? 1.02 : 1 }}
            whileTap={{ scale: cardNumber.length === 16 ? 0.98 : 1 }}
            onClick={() => {
              if (isLoading || isInserted) return;
              if (cardNumber.length >= 10) {
                handleInsertCard();
              }
            }}
            disabled={cardNumber.length !== 16 || isLoading || isInserted}
            className="w-[260px] mt-4 py-3 rounded-lg font-bold tracking-wider text-base
                     bg-gradient-to-b from-primary to-primary/80 text-primary-foreground
                     disabled:opacity-40 disabled:cursor-not-allowed
                     transition-all duration-200 shadow-lg shadow-primary/30
                     border border-primary/50 atm-button-3d"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Reading Card...
              </span>
            ) : (
              "INSERT CARD"
            )}
          </motion.button>

          <p className="text-xs text-muted-foreground mt-3 text-center">
            Enter your 16-digit ATM card number
          </p>
        </div>
      </ATMScreen>
    </ATMMachine> 
  );
}

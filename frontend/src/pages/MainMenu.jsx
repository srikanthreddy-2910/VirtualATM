import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ATMScreen from "../components/ATMScreen";
import ATMMachine from "../components/ATMMachine";
import { endSession } from "../api/atm.api";
import { useNavigate } from "react-router-dom";

import {
  Wallet,
  ArrowRightLeft,
  FileText,
  Settings,
  CreditCard,
  LogOut,
  PlusCircle,
} from "lucide-react";

const menuItems = [
  { id: "withdraw", label: "Cash Withdrawal", icon: Wallet, color: "primary" },
  { id: "deposit", label: "Cash Deposit", icon: PlusCircle },
  {
    id: "transfer",
    label: "Fund Transfer",
    icon: ArrowRightLeft,
    color: "accent",
  },
  {
    id: "balance",
    label: "Balance Enquiry",
    icon: FileText,
    color: "secondary",
  },
  {
    id: "pin-change",
    label: "Change PIN",
    icon: Settings,
    color: "muted-foreground",
  },
  {
    id: "mini-statement",
    label: "Mini Statement",
    icon: CreditCard,
    color: "primary",
  },
];

export default function MainMenu() {
  const navigate = useNavigate();

  const [selectedItem, setSelectedItem] = useState(null);
  const [balance] = useState(25000.0);

  useEffect(() => {
    const authenticated = sessionStorage.getItem("authenticated");
    if (!authenticated) {
      window.location.href = "/";
    }
  }, []);

  const handleMenuClick = (itemId) => {
    setSelectedItem(itemId);

    if (itemId === "exit") {
      sessionStorage.clear();
      window.location.href = "/";
    } else if (itemId === "withdraw") {
      navigate("/withdraw");
    } else if (itemId === "deposit") {
      window.location.href = "/deposit";
    } else if (itemId === "balance") {
      window.location.href = "/balance";
    } else if (itemId === "transfer") {
      window.location.href = "/transfer";
    } else if (itemId === "pin-change") {
      window.location.href = "/change-pin";
    } else if (itemId === "mini-statement") {
      window.location.href = "/statement";
    }
  };

  const handleExit = async () => {
    try {
      const sessionId = sessionStorage.getItem("sessionId");

      if (sessionId) {
        await endSession(sessionId);
      }
    } catch (err) {
      console.error("Failed to end session", err);
    } finally {
      sessionStorage.clear();
      window.location.href = "/";
    }
  };

  return (
    <ATMMachine>
      <ATMScreen title="MAIN MENU">
        <div className="flex flex-col">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6 py-[12px]"
          >
            <p className="text-primary text-glow ">Welcome Back</p>
            <p className="text-sm text-muted-foreground pt-[10px]">
              Card: ****
              {sessionStorage.getItem("cardNumber")?.slice(-4) || "0000"}
            </p>
          </motion.div>

          <div className="grid grid-cols-2 gap-3">
            {menuItems.map((item, index) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 + 0.2 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleMenuClick(item.id)}
                className={`
                  p-4 rounded-lg border transition-all duration-200
                  flex flex-col items-center gap-2
                  ${
                    item.id === "exit"
                      ? "bg-destructive/10 border-destructive/30 hover:bg-destructive/20"
                      : "bg-muted/10 border-primary/20 hover:bg-primary/10 hover:border-primary/40"
                  }
                  ${selectedItem === item.id ? "ring-2 ring-primary" : ""}
                `}
              >
                <item.icon
                  className={`w-6 h-6 ${
                    item.id === "exit" ? "text-destructive" : "text-primary"
                  }`}
                />
                <span className="text-xs text-center text-foreground">
                  {item.label}
                </span>
              </motion.button>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xs text-muted-foreground/50 text-center py-[16px]"
          >
            Select an option to proceed
          </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExit}
            className="
    mt-4 mx-auto
    px-10 py-3
    rounded-xl
    bg-destructive/20
    border border-destructive/40
    text-destructive
    flex items-center gap-2
    hover:bg-destructive/30
  "
          >
            <LogOut className="w-5 h-5" />
            Exit
          </motion.button>
        </div>
      </ATMScreen>
    </ATMMachine>
  );
}

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ATMScreen from "../components/ATMScreen";
import ATMMachine from "../components/ATMMachine";
import ATMKeypad from "../components/ATMKeypad";
import { validateCard, startSession } from "../api/atm.api";

export default function PinScreen() {
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(3);
  const [visiblePin, setVisiblePin] = useState(["", "", "", ""]);

  useEffect(() => {
    const cardNumber = sessionStorage.getItem("cardNumber");
    if (!cardNumber) {
      window.location.href = "/";
    }
  }, []);

  const handleKeyPress = (key) => {
    setError("");

    if (key === "CLEAR") {
      setPin("");
      setVisiblePin(["", "", "", ""]);
      return;
    }

    if (key === "ENTER") {
      handleVerifyPin();
      return;
    }

    if (pin.length >= 4) return;

    const index = pin.length;
    const newPin = pin + key;

    setPin(newPin);

    const newVisible = [...visiblePin];
    newVisible[index] = key;
    setVisiblePin(newVisible);

    setTimeout(() => {
      setVisiblePin((prev) => {
        const updated = [...prev];
        updated[index] = "*";
        return updated;
      });
    }, 2000);
  };

  const handleVerifyPin = async () => {
    if (pin.length !== 4) return;

    setIsLoading(true);
    setError("");

    try {
      const cardNumber = sessionStorage.getItem("cardNumber");
      const machineId = sessionStorage.getItem("machineId");

      const res = await validateCard(cardNumber, pin, machineId);
      console.log("validateCard res", res);
      if (res.data.success) {
        const { cardId, accountId, accountNo } = res.data.data;

        sessionStorage.setItem("cardId", cardId);
        sessionStorage.setItem("accountId", accountId);
        sessionStorage.setItem("accountNo", accountNo);

        sessionStorage.setItem("authenticated", "true");

        const sessionRes = await startSession(cardId, machineId);
        console.log("sessionRes", sessionRes);
        console.log("Session started", sessionRes.data.data);

        sessionStorage.setItem("sessionId", sessionRes.data.data.sessionId);

        window.location.href = "/menu";
      }
    } catch (err) {
      const data = err.response?.data;

      if (data?.data?.attemptsLeft !== undefined) {
        setAttempts(data.data.attemptsLeft);

        if (data.data.attemptsLeft === 0) {
          setError(
            "Last attempt remaining. Card will be blocked on next wrong PIN."
          );
        } else {
          setError(
            `Invalid PIN. ${data.data.attemptsLeft} attempts remaining.`
          );
        }
      } else if (data?.data?.unlockAt) {
        const unlockTime = new Date(data.data.unlockAt);

        const formatted = unlockTime.toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
        setError(`Card temporarily locked. Try later after ${formatted}`);
      } else {
        setError(data?.message || "PIN verification failed");
      }

      setTimeout(() => {
        setPin("");
        setVisiblePin(["", "", "", ""]);
        setError("");
      }, 2000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ATMMachine>
      <ATMScreen title="PIN VERIFICATION">
        <div className="flex flex-col items-center h-full justify-between">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mb-6"
          >
            <svg
              className="w-8 h-8 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <rect
                x="3"
                y="11"
                width="18"
                height="11"
                rx="2"
                ry="2"
                strokeWidth="2"
              />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeWidth="2" />
            </svg>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mb-6"
          >
            <p className="text-primary text-glow">Enter Your PIN</p>

            <div className="flex gap-4 justify-center mt-2">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={`text-3xl font-mono tracking-widest ${
                    visiblePin[i] ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {visiblePin[i] || "•"}
                </span>
              ))}
            </div>

            <p className="text-xs text-muted-foreground mt-1">
              Use the keypad below
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 mb-6"
          >
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                animate={pin.length === i ? { scale: [1, 1.1, 1] } : {}}
                className={`
                  w-14 h-14 rounded-lg border-2 flex items-center justify-center
                  transition-all duration-200
                  ${
                    i < pin.length
                      ? "border-primary bg-primary/10"
                      : "border-muted bg-input"
                  }
                `}
              >
                {i < pin.length && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-4 h-4 rounded-full bg-primary"
                  />
                )}
              </motion.div>
            ))}
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 px-4 py-2 rounded-lg bg-destructive/10 border border-destructive/30"
            >
              <p className="text-destructive text-sm">{error}</p>
            </motion.div>
          )}

          <div className="mt-auto">
            <ATMKeypad
              onDigit={(d) => handleKeyPress(d)}
              onBackspace={() => handleKeyPress("CLEAR")}
              onEnter={() => handleKeyPress("ENTER")}
              disabled={isLoading}
            />
          </div>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 flex items-center gap-2 text-secondary"
            >
              <div className="w-5 h-5 border-2 border-secondary/30 border-t-secondary rounded-full animate-spin" />
              <span>Verifying PIN...</span>
            </motion.div>
          )}
        </div>
      </ATMScreen>
    </ATMMachine>
  );
}

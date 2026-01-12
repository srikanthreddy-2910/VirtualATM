import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ATMScreen from "../components/ATMScreen";
import ATMMachine from "../components/ATMMachine";
import ATMKeypad from "../components/ATMKeypad";
import { ArrowLeft, Check } from "lucide-react";
import { changePin } from "../api/auth.api";

export default function ChangePin() {
  const [stage, setStage] = useState("old");

  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const navigate = useNavigate();

  const cardNumber = sessionStorage.getItem("cardNumber");
  const machineId = sessionStorage.getItem("machineId");

  useEffect(() => {
    if (!sessionStorage.getItem("authenticated")) {
      window.location.href = "/";
    }
  }, []);

  const handleDigit = (d) => {
    if (stage === "old" && oldPin.length < 4) setOldPin((p) => p + d);
    if (stage === "new" && newPin.length < 4) setNewPin((p) => p + d);
    if (stage === "confirm" && confirmPin.length < 4)
      setConfirmPin((p) => p + d);
  };

  const clear = () => {
    if (stage === "old") setOldPin("");
    if (stage === "new") setNewPin("");
    if (stage === "confirm") setConfirmPin("");
  };

  const next = async () => {
    if (stage === "old" && oldPin.length === 4) setStage("new");
    else if (stage === "new" && newPin.length === 4) setStage("confirm");
    else if (stage === "confirm" && confirmPin === newPin) {
      try {
        setStage("processing");
        await changePin({ cardNumber, oldPin, newPin, machineId });
        setStage("complete");
      } catch (err) {
        navigate("/tx-failure", {
          state: {
            message: err.response?.data?.message || "PIN change failed",
            from: "change-pin",
          },
        });
      }
    }
  };

  const getValue = () => {
    if (stage === "old") return oldPin;
    if (stage === "new") return newPin;
    if (stage === "confirm") return confirmPin;
    return "";
  };

  const getTitle = () => {
    if (stage === "old") return "Enter Old PIN";
    if (stage === "new") return "Enter New PIN";
    if (stage === "confirm") return "Confirm New PIN";
    return "";
  };

  return (
    <ATMMachine>
      <ATMScreen title="CHANGE PIN">
        <AnimatePresence mode="wait">
          {stage !== "complete" && stage !== "processing" && (
            <motion.div
              key={stage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col w-full"
            >
              <button
                onClick={() => {
                  if (stage === "new") setStage("old");
                  else if (stage === "confirm") setStage("new");
                  else navigate("/menu");
                }}
                className="
    w-full
    flex items-center gap-2
    px-3 py-2
    mb-4
    border border-primary/20
    rounded-lg
    text-muted-foreground
    hover:text-primary
    hover:bg-primary/10
  "
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

              <p className="text-primary font-semibold text-center mb-2">
                {getTitle()}
              </p>

              <div className="flex gap-4 mb-6 self-center">
                {[0, 1, 2, 3].map((i) => {
                  const filled = getValue().length > i;

                  return (
                    <div
                      key={i}
                      className="w-12 h-14  rounded-lg 
                   flex items-center justify-center 
                   bg-atm-screen text-primary
                   text-3xl font-bold tracking-widest"
                    >
                      {filled ? "*" : "•"}
                    </div>
                  );
                })}
              </div>

              <ATMKeypad
                onDigit={handleDigit}
                onBackspace={clear}
                onEnter={next}
              />
            </motion.div>
          )}

          {stage === "processing" && (
            <motion.div className="flex flex-col items-center justify-center h-full">
              <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
              <p className="text-primary">Updating PIN…</p>
            </motion.div>
          )}

          {stage === "complete" && (
            <motion.div className="flex flex-col items-center justify-center h-full">
              <div className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center mb-4">
                <Check className="w-10 h-10 text-primary" />
              </div>
              <p className="text-primary text-xl mb-6">
                PIN Changed Successfully
              </p>
              <button
                onClick={() => navigate("/menu")}
                className="px-6 py-3 bg-primary rounded text-primary-foreground"
              >
                Main Menu
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </ATMScreen>
    </ATMMachine>
  );
}

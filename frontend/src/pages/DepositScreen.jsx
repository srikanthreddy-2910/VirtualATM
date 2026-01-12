import { useState } from "react";
import { motion } from "framer-motion";
import ATMScreen from "../components/ATMScreen";
import ATMMachine from "../components/ATMMachine";
import ATMKeypad from "../components/ATMKeypad";
import { depositCash } from "../api/transaction.api";
import { Check, ArrowLeft } from "lucide-react";

export default function DepositScreen() {
  const [activeRow, setActiveRow] = useState(0);
  const [rows, setRows] = useState([{ note: 500, count: 0 }]);
  const [stage, setStage] = useState("input");
  const [depositedAmount, setDepositedAmount] = useState(0); 

  const cardId = sessionStorage.getItem("cardId");
  const accountId = sessionStorage.getItem("accountId");
  const machineId = sessionStorage.getItem("machineId");

  const total = rows.reduce((sum, r) => sum + r.note * r.count, 0);

  const addRow = () => {
    setRows([...rows, { note: 100, count: 0 }]);
  };

  const updateRow = (index, key, value) => {
    const copy = [...rows];
    copy[index][key] = Number(value);
    setRows(copy);
  };

  const handleKeypad = (key) => {
    const copy = [...rows];

    if (key === "CLEAR") {
      copy[activeRow].count = 0;
    } else if (key === "ENTER") {
      if (activeRow < rows.length - 1) {
        setActiveRow(activeRow + 1);
      }
    } else {
      copy[activeRow].count = Number(`${copy[activeRow].count}${key}`);
    }

    setRows(copy);
  };

  const handleConfirm = async () => {
    try {
      if (total === 0) {
        alert("Insert cash before depositing");
        return;
      }

      setStage("processing");

      const notes = {};
      rows.forEach((r) => {
        if (r.count > 0) notes[r.note] = (notes[r.note] || 0) + r.count;
      });

      await depositCash({ cardId, accountId, machineId, notes });

      setDepositedAmount(total);
      setStage("complete");
    } catch (err) {
      alert(err.response?.data?.message || "Deposit failed");
      setStage("input");
    }
  };

  return (
    <ATMMachine>
      <ATMScreen title="CASH DEPOSIT">
        {stage === "input" && (
          <div className="flex flex-col">
            <p className="mb-4 text-primary">Insert Cash</p>
            <button
              onClick={() => (window.location.href = "/menu")}
              className="flex items-center gap-2 text-muted-foreground mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Menu
            </button>
            <div className="space-y-3">
              {rows.map((row, i) => (
                <div key={i} className="flex gap-3">
                  <select
                    value={row.note}
                    onChange={(e) => updateRow(i, "note", e.target.value)}
                    className="flex-1 bg-input border border-primary/30 rounded p-2"
                  >
                    <option value={500}>₹500</option>
                    <option value={200}>₹200</option>
                    <option value={100}>₹100</option>
                    <option value={50}>₹50</option>
                  </select>

                  <input
                    type="text"
                    value={row.count === 0 ? "" : row.count}
                    readOnly
                    placeholder="Qty"
                    onClick={() => setActiveRow(i)}
                    className={`w-20 text-center bg-input border rounded p-2
                    ${
                      activeRow === i ? "border-primary" : "border-primary/30"
                    }`}
                  />
                </div>
              ))}
            </div>

            <button
              onClick={addRow}
              className="mt-4 border border-primary/40 rounded py-2 text-primary"
            >
              + Add Note
            </button>

            <p className="mt-6 text-lg text-primary">
              Total: ₹{total.toLocaleString()}
            </p>

            <button
              onClick={handleConfirm}
              className="mt-4 w-full bg-primary py-3 rounded text-primary-foreground"
            >
              Deposit
            </button>

            <div className="mt-6  flex justify-center">
              <ATMKeypad
                onDigit={(d) => handleKeypad(d)}
                onBackspace={() => handleKeypad("CLEAR")}
                onEnter={() => handleKeypad("ENTER")}
              />
            </div>
          </div>
        )}
        {stage === "processing" && <p>Processing Deposit...</p>}
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
              Deposit Successful
            </p>

            <p className="text-muted-foreground text-sm mb-8">
              ₹{depositedAmount.toLocaleString()} deposited successfully
            </p>

            <div className="flex gap-4">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setRows([{ note: 500, count: 0 }]);
                  setStage("input");
                }}
                className="px-6 py-3 rounded-lg bg-muted border border-primary/30 text-foreground"
              >
                Another Deposit
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
      </ATMScreen>
    </ATMMachine>
  );
}

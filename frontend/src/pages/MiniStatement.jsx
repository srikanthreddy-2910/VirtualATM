import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMiniStatement } from "../api/transaction.api";
import ATMScreen from "../components/ATMScreen";
import ATMMachine from "../components/ATMMachine";

export default function MiniStatement() {
  const [txs, setTxs] = useState([]);
  const navigate = useNavigate();
  const cardId = sessionStorage.getItem("cardId");

  const getTransferTarget = (desc) => {
    if (!desc) return "";
    const parts = desc.split("→");
    if (parts.length < 2) return "";
    return parts[1].trim();
  };

  useEffect(() => {
    if (!cardId) return;

    async function fetchTx() {
      try {
        const res = await getMiniStatement(cardId);
        console.log("Mini statement", res.data.data);
        setTxs(res.data.data);
      } catch (err) {
        console.error("Mini statement failed", err);
      }
    }

    fetchTx();
  }, [cardId]);

  const formatDateTime = (dt) => {
    const d = new Date(dt);
    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <ATMMachine>
      <ATMScreen title="MINI STATEMENT">
        <div className="flex flex-col h-full">
          <div className="text-center mb-4">
            <p className="text-primary text-glow text-sm tracking-wider">
              Last Transactions
            </p>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 px-1">
            {txs.map((tx, i) => (
              <div
                key={i}
                className="flex justify-between items-center 
                         px-3 py-2
                         rounded-lg
                         bg-atm-screen/50
                         border border-primary/20"
              >
                <div className="w-[30%] text-primary text-xs font-semibold uppercase">
                  {tx.transaction_type === "TRANSFER" ? (
                    <div className="flex flex-col leading-tight">
                      <span>TRANSFER</span>
                      <span className="text-[10px] text-muted-foreground">
                        → {getTransferTarget(tx.description)}
                      </span>
                    </div>
                  ) : (
                    tx.transaction_type
                  )}
                </div>

                <div className="w-[40%] text-center text-xs text-muted-foreground">
                  {formatDateTime(tx.transaction_date)}
                </div>

                <div
                  className={`w-[30%] text-right font-mono font-semibold
                  ${
                    tx.transaction_type === "WITHDRAWAL"
                      ? "text-red-400"
                      : "text-green-400"
                  }
                `}
                >
                  ₹{tx.amount.toLocaleString()}
                </div>
              </div>
            ))}

            {txs.length === 0 && (
              <p className="text-center text-muted-foreground mt-8">
                No transactions found
              </p>
            )}
          </div>

          <button
            onClick={() => navigate("/menu")}
            className="
            mt-4
            w-full
            py-3
            rounded-lg
            border border-primary/30
            bg-muted
            text-primary
            hover:bg-primary/10
            transition
          "
          >
            Back to Menu
          </button>
        </div>
      </ATMScreen>
    </ATMMachine>
  );
}

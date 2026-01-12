import { useLocation, useNavigate } from "react-router-dom";
import ATMScreen from "../components/ATMScreen";
import ATMMachine from "../components/ATMMachine";
import { AlertTriangle } from "lucide-react";

export default function TransactionFailure() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const message = state?.message || "Unable to process your transaction";
  const from = state?.from || "withdraw";

  return (
    <ATMMachine>
      <ATMScreen title="TRANSACTION FAILED">
        <div className="flex flex-col items-center justify-center h-full text-center">
          <AlertTriangle className="w-16 h-16 text-destructive mb-6" />

          <p className="text-destructive text-lg mb-3">
            Transaction Unsuccessful
          </p>

          <p className="text-muted-foreground text-sm mb-8">{message}</p>

          <div className="flex gap-4">
            <button
              onClick={() => navigate("/menu")}
              className="px-6 py-3 rounded-lg bg-muted border border-primary/30 text-foreground"
            >
              Main Menu
            </button>

            <button
              onClick={() => {
                if (from === "transfer") navigate("/transfer");
                else if (from === "change-pin") navigate("/change-pin");
                else navigate("/withdraw");
              }}
              className="px-6 py-3 rounded-lg bg-primary text-primary-foreground"
            >
              Try Again
            </button>
          </div>
        </div>
      </ATMScreen>
    </ATMMachine>
  );
}

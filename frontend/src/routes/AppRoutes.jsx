import { Routes, Route } from "react-router-dom";

import WelcomeScreen from "../pages/WelcomeScreen";
import PinScreen from "../pages/PinScreen";
import MainMenu from "../pages/MainMenu";
import WithdrawScreen from "../pages/WithdrawScreen";
import DepositScreen from "../pages/DepositScreen";
import BalanceScreen from "../pages/BalanceScreen";
import MiniStatement from "../pages/MiniStatement";
import TransferScreen from "../pages/TransferScreen";
import ChangePin from "../pages/ChangePin";
import TransactionFailure from "../pages/TransactionFailure";

import ProtectedRoute from "./ProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<WelcomeScreen />} />
      <Route path="/pin" element={<PinScreen />} />

      <Route
        path="/menu"
        element={
          <ProtectedRoute>
            <MainMenu />
          </ProtectedRoute>
        }
      />

      <Route
        path="/withdraw"
        element={
          <ProtectedRoute>
            <WithdrawScreen />
          </ProtectedRoute>
        }
      />
      <Route
        path="/deposit"
        element={
          <ProtectedRoute>
            <DepositScreen />
          </ProtectedRoute>
        }
      />

      <Route
        path="/balance"
        element={
          <ProtectedRoute>
            <BalanceScreen />
          </ProtectedRoute>
        }
      />

      <Route
        path="/statement"
        element={
          <ProtectedRoute>
            <MiniStatement />
          </ProtectedRoute>
        }
      />

      <Route
        path="/transfer"
        element={
          <ProtectedRoute>
            <TransferScreen />
          </ProtectedRoute>
        }
      />

      <Route
        path="/change-pin"
        element={
          <ProtectedRoute>
            <ChangePin />
          </ProtectedRoute>
        }
      />

      <Route
        path="/tx-failure"
        element={
          <ProtectedRoute>
            <TransactionFailure />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

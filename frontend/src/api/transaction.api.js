import API from "./constant.api";

export const withdrawCash = (data) =>
  API.post("/transactions/withdraw", data);

export const depositCash = (data) =>
  API.post("/transactions/deposit", data);

export const getMiniStatement = (cardId) =>
  API.get("/transactions/statement", {
    params: { cardId },
  });

export const transferFunds = (data) =>
  API.post("/transactions/transfer", data);

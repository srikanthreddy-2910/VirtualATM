import API from "./constant.api";

export const getBalance = (accountId) =>
  API.get("/accounts/balance", {
    params: { accountId },
  });

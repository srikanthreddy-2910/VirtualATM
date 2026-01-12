import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

export const getBalance = (accountId) =>
  API.get(`/accounts/balance`, {
    params: { accountId },
  });

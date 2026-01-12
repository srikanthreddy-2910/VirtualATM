import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

export const insertCard = (cardNumber, machineId) =>
  API.post("/atm/card/insert", { cardNumber, machineId });

export const validateCard = (cardNumber, pin, machineId) =>
  API.post("/atm/card/validate", { cardNumber, pin, machineId });

export const startSession = (cardId, machineId) =>
  API.post("/atm/session/start", { cardId, machineId });

export const endSession = (sessionId) =>
  API.post("/atm/session/end", { sessionId });

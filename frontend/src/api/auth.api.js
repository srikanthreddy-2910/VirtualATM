import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

export const changePin = (data) => API.post("/auth/change-pin", data);

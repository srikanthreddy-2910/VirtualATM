import API from "./constant.api";

export const changePin = (data) =>
  API.post("/auth/change-pin", data);

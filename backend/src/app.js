const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://virtual-atm.vercel.app"
    ],
    credentials: true,
  })
);


app.use(express.json());

app.get("/", (req, res) => {
  res.send("Virtual ATM Backend Running");
});
app.use("/api/atm", require("./routes/atm.routes"));
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/accounts", require("./routes/account.routes"));
app.use("/api/transactions", require("./routes/transaction.routes")); 

module.exports = app;

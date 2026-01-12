const db = require("../config/db");

module.exports.getAccounts = async (req, res) => {
  try {
    const { cardId } = req.query;

    const [rows] = await db.query(
      `SELECT 
          a.account_id,
          a.account_number,
          a.account_type,
          a.balance,
          a.status
       FROM accounts a
       JOIN atm_cards c ON c.account_id = a.account_id
       WHERE c.card_id = ?`,
      [cardId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: "Account fetched successfully",
      data: rows[0],
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

module.exports.getBalance = async (req, res) => {
  try {
    const { accountId } = req.query;

    const [rows] = await db.query(
      "SELECT balance FROM accounts WHERE account_id = ?",
      [accountId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: "Balance fetched successfully",
      data: { balance: rows[0].balance },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

module.exports.getLimits = async (req, res) => {
  try {
    const { cardId } = req.query;

    const [rows] = await db.query(
      `SELECT daily_withdraw_limit 
       FROM atm_cards 
       WHERE card_id = ?`,
      [cardId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Card not found",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: "Daily withdrawal limit fetched",
      data: { daily_limit: rows[0].daily_withdraw_limit },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

module.exports.getTransactions = async (req, res) => {
  try {
    const { cardId, limit = 10 } = req.query;

    const [rows] = await db.query(
      `SELECT transaction_id, transaction_type, amount, transaction_date, status
       FROM transactions
       WHERE card_id = ?
       ORDER BY transaction_date DESC
       LIMIT ?`,
      [cardId, Number(limit)]
    );

    res.status(200).json({
      success: true,
      message: "Transactions fetched successfully",
      data: rows,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

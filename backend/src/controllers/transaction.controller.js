const db = require("../config/db");
const { calculateDenominations } = require("../utils/denomination.util");

module.exports.withdraw = async (req, res) => {
  const { cardId, accountId, machineId, amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid withdrawal amount",
      data: null,
    });
  }

  try {
    await db.query("START TRANSACTION");

    const [[atm]] = await db.query(
      "SELECT is_online FROM atm_machines WHERE machine_id = ? FOR UPDATE",
      [machineId]
    );

    if (!atm || !atm.is_online) {
      await db.query("ROLLBACK");

      await db.query(
        `INSERT INTO transactions
         (card_id, machine_id, transaction_type, amount, status)
         VALUES (?, ?, 'WITHDRAWAL', ?, 'FAILED')`,
        [cardId, machineId, amount]
      );

      return res.status(400).json({
        success: false,
        message: "ATM is offline",
        data: null,
      });
    }

    const [[card]] = await db.query(
      `SELECT daily_withdraw_limit
       FROM atm_cards
       WHERE card_id = ?
         AND account_id = ?
         AND status = 'ACTIVE'`,
      [cardId, accountId]
    );

    if (!card) {
      await db.query("ROLLBACK");

      await db.query(
        `INSERT INTO transactions
         (card_id, machine_id, transaction_type, amount, status)
         VALUES (?, ?, 'WITHDRAWAL', ?, 'FAILED')`,
        [cardId, machineId, amount]
      );

      return res.status(403).json({
        success: false,
        message: "Card is blocked / inactive / invalid",
        data: null,
      });
    }

    const [[today]] = await db.query(
      `SELECT IFNULL(SUM(amount),0) total
       FROM transactions
       WHERE card_id = ?
         AND transaction_type = 'WITHDRAWAL'
         AND DATE(transaction_date) = CURDATE()
         AND status = 'COMPLETED'`,
      [cardId]
    );

    if (today.total + amount > card.daily_withdraw_limit) {
      await db.query("ROLLBACK");

      await db.query(
        `INSERT INTO transactions
         (card_id, machine_id, transaction_type, amount, status)
         VALUES (?, ?, 'WITHDRAWAL', ?, 'FAILED')`,
        [cardId, machineId, amount]
      );

      return res.status(403).json({
        success: false,
        message: "Daily withdrawal limit exceeded",
        data: null,
      });
    }

    const [[account]] = await db.query(
      "SELECT balance FROM accounts WHERE account_id = ? FOR UPDATE",
      [accountId]
    );

    if (!account || account.balance < amount) {
      await db.query("ROLLBACK");

      await db.query(
        `INSERT INTO transactions
         (card_id, machine_id, transaction_type, amount, status)
         VALUES (?, ?, 'WITHDRAWAL', ?, 'FAILED')`,
        [cardId, machineId, amount]
      );

      return res.status(400).json({
        success: false,
        message: "Insufficient account balance",
        data: null,
      });
    }

    const [notes] = await db.query(
      `SELECT note_value, note_count
       FROM atm_denominations
       WHERE machine_id = ?
       ORDER BY note_value DESC
       FOR UPDATE`,
      [machineId]
    );

    const totalCash = notes.reduce(
      (sum, n) => sum + n.note_value * n.note_count,
      0
    );

    if (totalCash < amount) {
      await db.query("ROLLBACK");

      await db.query(
        `INSERT INTO transactions
         (card_id, machine_id, transaction_type, amount, status)
         VALUES (?, ?, 'WITHDRAWAL', ?, 'FAILED')`,
        [cardId, machineId, amount]
      );

      return res.status(400).json({
        success: false,
        message: "ATM has insufficient cash",
        data: null,
      });
    }

    const minNote = Math.min(...notes.map((n) => n.note_value));
    if (amount % minNote !== 0) {
      await db.query("ROLLBACK");

      await db.query(
        `INSERT INTO transactions
         (card_id, machine_id, transaction_type, amount, status)
         VALUES (?, ?, 'WITHDRAWAL', ?, 'FAILED')`,
        [cardId, machineId, amount]
      );

      return res.status(400).json({
        success: false,
        message: `Amount must be multiple of ₹${minNote}`,
        data: null,
      });
    }

    const denominations = calculateDenominations(amount, notes);
    if (!denominations) {
      await db.query("ROLLBACK");

      await db.query(
        `INSERT INTO transactions
         (card_id, machine_id, transaction_type, amount, status)
         VALUES (?, ?, 'WITHDRAWAL', ?, 'FAILED')`,
        [cardId, machineId, amount]
      );

      return res.status(400).json({
        success: false,
        message: "ATM cannot dispense this amount",
        data: null,
      });
    }

    await db.query(
      "UPDATE accounts SET balance = balance - ? WHERE account_id = ?",
      [amount, accountId]
    );

    for (const note in denominations) {
      await db.query(
        `UPDATE atm_denominations
         SET note_count = note_count - ?
         WHERE machine_id = ? AND note_value = ?`,
        [denominations[note], machineId, note]
      );
    }

    await db.query(
      `INSERT INTO transactions
       (card_id, machine_id, transaction_type, amount, status)
       VALUES (?, ?, 'WITHDRAWAL', ?, 'COMPLETED')`,
      [cardId, machineId, amount]
    );

    await db.query(
      `UPDATE atm_machines
       SET cash_balance = cash_balance - ?
       WHERE machine_id = ?`,
      [amount, machineId]
    );

    await db.query("COMMIT");

    res.status(200).json({
      success: true,
      message: "Withdrawal successful",
      data: { denominations },
    });
  } catch (err) {
    await db.query("ROLLBACK");

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

module.exports.deposit = async (req, res) => {
  try {
    const { cardId, accountId, machineId, notes } = req.body;

    if (!notes || Object.keys(notes).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No cash inserted",
        data: null,
      });
    }

    let amount = 0;
    for (const note in notes) {
      if (notes[note] <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid note count",
          data: null,
        });
      }
      amount += Number(note) * notes[note];
    }

    await db.query("START TRANSACTION");

    const [[atm]] = await db.query(
      "SELECT is_online FROM atm_machines WHERE machine_id = ? FOR UPDATE",
      [machineId]
    );

    if (!atm || !atm.is_online) {
      await db.query("ROLLBACK");
      return res.status(400).json({
        success: false,
        message: "ATM is offline",
        data: null,
      });
    }

    const [[card]] = await db.query(
      "SELECT card_id FROM atm_cards WHERE card_id = ? AND account_id = ?",
      [cardId, accountId]
    );

    if (!card) {
      await db.query("ROLLBACK");
      return res.status(403).json({
        success: false,
        message: "Invalid card for this account",
        data: null,
      });
    }

    await db.query(
      "SELECT balance FROM accounts WHERE account_id = ? FOR UPDATE",
      [accountId]
    );

    await db.query(
      "UPDATE accounts SET balance = balance + ? WHERE account_id = ?",
      [amount, accountId]
    );

    for (const note in notes) {
      await db.query(
        `INSERT INTO atm_denominations (machine_id, note_value, note_count)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE
         note_count = note_count + VALUES(note_count)`,
        [machineId, note, notes[note]]
      );
    }

    await db.query(
      `UPDATE atm_machines
       SET cash_balance = cash_balance + ?
       WHERE machine_id = ?`,
      [amount, machineId]
    );

    await db.query(
      `INSERT INTO transactions
       (card_id, machine_id, transaction_type, amount, status)
       VALUES (?, ?, 'DEPOSIT', ?, 'COMPLETED')`,
      [cardId, machineId, amount]
    );

    await db.query("COMMIT");

    res.status(200).json({
      success: true,
      message: "Deposit successful",
      data: { amount, notes },
    });
  } catch (err) {
    await db.query("ROLLBACK");
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

module.exports.transfer = async (req, res) => {
  try {
    const { fromAccountNo, toAccountNo, amount, machineId } = req.body;

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid transfer amount",
        data: null,
      });
    }

    if (fromAccountNo === toAccountNo) {
      return res.status(400).json({
        success: false,
        message: "Cannot transfer to same account",
        data: null,
      });
    }

    await db.query("START TRANSACTION");

    const [[from]] = await db.query(
      `SELECT a.account_id, a.balance, c.card_id
   FROM accounts a
   JOIN atm_cards c ON c.account_id = a.account_id
   WHERE a.account_number = ? FOR UPDATE`,
      [fromAccountNo]
    );

    if (!from) {
      await db.query("ROLLBACK");
      return res.status(404).json({
        success: false,
        message: "Sender account not found",
        data: null,
      });
    }

    if (from.balance < amount) {
      await db.query("ROLLBACK");
      return res.status(400).json({
        success: false,
        message: "Insufficient balance",
        data: null,
      });
    }

    const [[to]] = await db.query(
      "SELECT account_id FROM accounts WHERE account_number = ? FOR UPDATE",
      [toAccountNo]
    );

    if (!to) {
      await db.query("ROLLBACK");
      return res.status(404).json({
        success: false,
        message: "Receiver account not found",
        data: null,
      });
    }

    await db.query(
      "UPDATE accounts SET balance = balance - ? WHERE account_id = ?",
      [amount, from.account_id]
    );

    await db.query(
      "UPDATE accounts SET balance = balance + ? WHERE account_id = ?",
      [amount, to.account_id]
    );

    await db.query(
      `INSERT INTO transactions
   (card_id, account_id, machine_id, transaction_type, amount, status, description)
   VALUES (?, ?, ?, 'TRANSFER', ?, 'COMPLETED', ?)`,
      [
        from.card_id,
        from.account_id,
        machineId,
        amount,
        `${fromAccountNo} → ${toAccountNo}`,
      ]
    );

    await db.query("COMMIT");

    res.status(200).json({
      success: true,
      message: "Transfer successful",
      data: {
        from: fromAccountNo,
        to: toAccountNo,
        amount,
      },
    });
  } catch (err) {
    await db.query("ROLLBACK");
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

module.exports.statement = async (req, res) => {
  try {
    const { cardId, limit = 5 } = req.query;

    if (!cardId) {
      return res.status(400).json({
        success: false,
        message: "cardId is required",
      });
    }

    const [rows] = await db.query(
      `SELECT transaction_type, amount, transaction_date, status, description
       FROM transactions
       WHERE card_id = ?
         AND status = 'COMPLETED'
       ORDER BY transaction_date DESC
       LIMIT ?`,
      [cardId, Number(limit)]
    );

    res.status(200).json({
      success: true,
      message: "Mini statement fetched successfully",
      data: rows,
    });
  } catch (err) {
    console.error("Mini statement error:", err);

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

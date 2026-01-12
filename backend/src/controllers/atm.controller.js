const db = require("../config/db");
const { logAudit } = require("../utils/audit.util");

const MAX_ATTEMPTS = 3;
const LOCK_MINUTES = 15;

module.exports.validateCard = async (req, res) => {
  try {
    const { cardNumber, pin, machineId } = req.body;

    await db.query("START TRANSACTION");

    const [[card]] = await db.query(
      `SELECT 
        c.card_id,
        c.account_id,
        c.pin,
        c.expiry_date,
        c.status,
        c.failed_attempts,
        c.locked_until,
        a.account_number
      FROM atm_cards c
      JOIN accounts a ON a.account_id = c.account_id
      WHERE c.atm_card_number = ?
      FOR UPDATE`,
      [cardNumber]
    );

    if (!card) {
      await db.query("ROLLBACK");
      return res.status(404).json({
        success: false,
        message: "Invalid card",
      });
    }

    if (new Date(card.expiry_date) < new Date()) {
      await db.query("UPDATE atm_cards SET status='EXPIRED' WHERE card_id=?", [
        card.card_id,
      ]);
      await db.query("ROLLBACK");
      return res.status(403).json({
        success: false,
        message: "Card expired",
      });
    }

    if (
      ["BLOCKED", "LOST", "CLOSED", "SUSPENDED", "EXPIRED"].includes(
        card.status
      )
    ) {
      await db.query("ROLLBACK");
      return res.status(403).json({
        success: false,
        message: `Card is permanently blocked (${card.status})`,
      });
    }

    if (card.locked_until && new Date(card.locked_until) <= new Date()) {
      await db.query(
        `UPDATE atm_cards
     SET locked_until=NULL, failed_attempts=0, status='ACTIVE'
     WHERE card_id=?`,
        [card.card_id]
      );

      card.failed_attempts = 0;
      card.locked_until = null;
      card.status = "ACTIVE";
    }

    if (card.status === "TEMP_BLOCKED" && card.locked_until) {
      const unlock = new Date(card.locked_until);
      const mins = Math.ceil((unlock - new Date()) / 60000);

      await db.query("ROLLBACK");
      return res.status(423).json({
        success: false,
        message: `Card temporarily blocked. Try after ${mins} minutes`,
        data: { unlockAt: unlock },
      });
    }

    const isValidPin = pin === card.pin;

    if (!isValidPin) {
      const attempts = card.failed_attempts + 1;

      if (attempts >= MAX_ATTEMPTS) {
        const lockUntil = new Date(Date.now() + LOCK_MINUTES * 60000);
        console.log("Locking card until", lockUntil);
        const [result] = await db.query(
          `UPDATE atm_cards
   SET failed_attempts=?, locked_until=?, status='TEMP_BLOCKED'
   WHERE card_id=?`,
          [attempts, lockUntil, card.card_id]
        );

        await db.query("COMMIT");

        return res.status(400).json({
          success: false,
          message: `PIN blocked. Try again after ${LOCK_MINUTES} minutes`,
          data: { unlockAt: lockUntil },
        });
      }

      await db.query("UPDATE atm_cards SET failed_attempts=? WHERE card_id=?", [
        attempts,
        card.card_id,
      ]);

      await db.query("COMMIT");
      return res.status(400).json({
        success: false,
        message: "Invalid PIN",
        data: { attemptsLeft: MAX_ATTEMPTS - attempts },
      });
    }

    await db.query(
      `UPDATE atm_cards
       SET failed_attempts=0, locked_until=NULL, status='ACTIVE'
       WHERE card_id=?`,
      [card.card_id]
    );

    await db.query("COMMIT");

    return res.status(200).json({
      success: true,
      message: "PIN verified",
      data: {
        cardId: card.card_id,
        accountId: card.account_id,
        accountNo: card.account_number,
      },
    });
  } catch (err) {
    try {
      await db.query("ROLLBACK");
    } catch (e) {}

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

module.exports.insertCard = async (req, res) => {
  try {
    const { cardNumber, machineId } = req.body;

    const [rows] = await db.query(
      "SELECT * FROM atm_cards WHERE atm_card_number = ?",
      [cardNumber]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Invalid card",
        data: null,
      });
    }

    const card = rows[0];

    if (card.status !== "ACTIVE") {
      await logAudit({
        card_id: card.card_id,
        machine_id: machineId,
        activity_type: "LOGIN",
        activity_details: { reason: "Card not active" },
        status: "FAILED",
      });

      return res.status(403).json({
        success: false,
        message: "Card blocked or inactive",
        data: null,
      });
    }

    const [[session]] = await db.query(
      "SELECT session_id FROM atm_sessions WHERE card_id = ? AND is_active = true",
      [card.card_id]
    );

    if (session) {
      return res.status(403).json({
        success: false,
        message: "Card already in use at another ATM",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: "Card inserted successfully",
      data: { cardId: card.card_id },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

module.exports.startSession = async (req, res) => {
  try {
    const { cardId, machineId } = req.body;

    const [[active]] = await db.query(
      "SELECT session_id FROM atm_sessions WHERE card_id = ? AND is_active = true",
      [cardId]
    );

    if (active) {
      return res.status(400).json({
        success: false,
        message: "Session already active for this card",
      });
    }

    const [[card]] = await db.query(
      "SELECT card_id FROM atm_cards WHERE card_id = ?",
      [cardId]
    );

    if (!card) {
      return res.status(400).json({
        success: false,
        message: "Invalid card",
      });
    }

    const [result] = await db.query(
      `INSERT INTO atm_sessions (card_id, machine_id)
       VALUES (?, ?)`,
      [cardId, machineId]
    );

    await logAudit({
      card_id: cardId,
      machine_id: machineId,
      activity_type: "LOGIN",
      activity_details: { session_id: result.insertId },
      status: "SUCCESS",
    });

    res.status(200).json({
      success: true,
      message: "Session started",
      data: { sessionId: result.insertId },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

module.exports.endSession = async (req, res) => {
  try {
    const { sessionId, cardId, machineId } = req.body;

    const [[session]] = await db.query(
      "SELECT card_id, machine_id FROM atm_sessions WHERE session_id = ?",
      [sessionId]
    );

    if (!session) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid session" });
    }

    await db.query(
      `UPDATE atm_sessions
       SET is_active = false,
           ended_at = NOW()
       WHERE session_id = ?`,
      [sessionId]
    );

    await logAudit({
      card_id: session.card_id,
      machine_id: session.machine_id,
      activity_type: "LOGOUT",
      activity_details: { session_id: sessionId },
      status: "SUCCESS",
    });

    res.status(200).json({
      success: true,
      message: "Session ended",
      data: null,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

module.exports.blockCard = async (req, res) => {
  try {
    const { cardId } = req.body;

    await db.query(
      "UPDATE atm_cards SET status = 'BLOCKED' WHERE card_id = ?",
      [cardId]
    );

    res.status(200).json({
      success: true,
      message: "Card blocked successfully",
      data: null,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

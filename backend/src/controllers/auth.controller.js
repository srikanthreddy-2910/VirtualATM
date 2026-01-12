const db = require("../config/db");
const { logAudit } = require("../utils/audit.util");

module.exports.changePin = async (req, res) => {
  try {
    const { cardNumber, oldPin, newPin, machineId } = req.body;

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

    if (oldPin !== card.pin) {
      return res.status(401).json({
        success: false,
        message: "Old PIN is incorrect",
        data: null,
      });
    }

    if (oldPin === newPin) {
      return res.status(400).json({
        success: false,
        message: "New PIN cannot be same as old PIN",
        data: null,
      });
    }

    await db.query(
      `UPDATE atm_cards
       SET pin = ?, failed_attempts = 0
       WHERE card_id = ?`,
      [newPin, card.card_id]
    );

    await logAudit({
      card_id: card.card_id,
      machine_id: machineId,
      activity_type: "PIN_CHANGE",
      activity_details: {},
      status: "SUCCESS",
    });

    res.status(200).json({
      success: true,
      message: "PIN changed successfully",
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

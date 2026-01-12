const db = require("../config/db");
const { logAudit } = require("../utils/audit.util");


module.exports.getStatus = async (req, res) => {
  try {
    const { machineId } = req.query;

    const [rows] = await db.query(
      `SELECT machine_id, location, is_online, last_maintenance
       FROM atm_machines
       WHERE machine_id = ?`,
      [machineId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "ATM not found",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: "ATM status fetched successfully",
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


module.exports.getCash = async (req, res) => {
  try {
    const { machineId } = req.query;

    const [denoms] = await db.query(
      `SELECT note_value, note_count,
              (note_value * note_count) AS total
       FROM atm_denominations
       WHERE machine_id = ?
       ORDER BY note_value DESC`,
      [machineId]
    );

    let totalCash = 0;
    denoms.forEach((d) => (totalCash += d.total));

    res.status(200).json({
      success: true,
      message: "ATM cash details fetched successfully",
      data: {
        machine_id: machineId,
        total_cash: totalCash,
        denominations: denoms,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

module.exports.updateCash = async (req, res) => {
  try {
    const { machineId, denominations } = req.body;

    await db.query("START TRANSACTION");

    for (const d of denominations) {
      await db.query(
        `INSERT INTO atm_denominations (machine_id, note_value, note_count)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE note_count = note_count + VALUES(note_count)`,
        [machineId, d.note_value, d.note_count]
      );
    }

    const [[total]] = await db.query(
      `SELECT SUM(note_value * note_count) AS total
       FROM atm_denominations
       WHERE machine_id = ?`,
      [machineId]
    );

    await db.query(
      `UPDATE atm_machines
       SET cash_balance = ?, last_maintenance = NOW()
       WHERE machine_id = ?`,
      [total.total, machineId]
    );

    await db.query("COMMIT");

    res.status(200).json({
      success: true,
      message: "ATM cash updated successfully",
      data: {
        total_cash: total.total,
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

const db = require("../config/db");

module.exports.logAudit = (data) => {
  const { card_id, machine_id, activity_type, activity_details, status } = data;

  db.query(
    `INSERT INTO audit_logs
     (card_id, machine_id, activity_type, activity_details, status)
     VALUES (?, ?, ?, ?, ?)`,
    [
      card_id,
      machine_id,
      activity_type,
      JSON.stringify(activity_details),
      status,
    ]
  );
};

module.exports.calculateDenominations = (amount, notes) => {
  const result = {};
  let remaining = amount;

  for (const note of notes) {
    const canUse = Math.min(
      Math.floor(remaining / note.note_value),
      note.note_count
    );

    if (canUse > 0) {
      result[note.note_value] = canUse;
      remaining -= canUse * note.note_value;
    }
  }

  if (remaining !== 0) return null;
  return result;
};

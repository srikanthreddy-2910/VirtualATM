import { motion } from "framer-motion";

const keys = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["CLEAR", "0", "ENTER"],
];

export default function ATMKeypad({
  onDigit,
  onBackspace,
  onEnter,
  disabled = false,
}) {
  const handleKey = (key) => {
    if (disabled) return;

    if (key === "CLEAR") {
      onBackspace?.();
    } else if (key === "ENTER") {
      onEnter?.();
    } else {
      onDigit?.(key);
    }
  };

  const getKeyStyle = (key) => {
    if (key === "ENTER") {
      return "bg-gradient-to-b from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/30";
    }
    if (key === "CLEAR") {
      return "bg-gradient-to-b from-destructive to-destructive/80 text-destructive-foreground shadow-lg shadow-destructive/30";
    }
    return "bg-gradient-to-b from-atm-button to-atm-button-active text-foreground";
  };

  return (
    <div className=" max-w-xl p-6 bg-gradient-to-b from-atm-bezel/50 to-background rounded-2xl border border-atm-metal/40 mx-auto">
      <div className="grid grid-cols-3 gap-4 ">
        {keys.flat().map((key) => (
          <motion.button
            key={key}
            whileTap={{ scale: 0.95, y: 2 }}
            whileHover={{ scale: disabled ? 1 : 1.02 }}
            onClick={() => handleKey(key)}
            disabled={disabled}
            className={`
              w-[42px] h-[42px] sm:h-[42px]
              rounded-xl font-bold tracking-widest
              atm-button-3d
              border border-atm-metal/30
              ${getKeyStyle(key)}
              ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            `}
          >
            {key === "CLEAR" ? "⌫" : key}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

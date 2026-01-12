import { motion } from "framer-motion";

export default function ATMCardSlot({ cardNumber, isInserted, isLoading }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-full max-w-[280px] mx-auto"
    >
      <motion.div
        animate={{
          x: isInserted ? -20 : 0,
          opacity: isInserted ? 0.5 : 1,
        }}
        transition={{ duration: 0.5 }}
        className="relative bg-gradient-to-br from-accent via-accent/80 to-accent/60 rounded-xl p-4 shadow-xl border border-accent/30"
      >
        <div className="absolute top-4 left-4">
          <div className="w-10 h-7 bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-md shadow-inner flex items-center justify-center">
            <div className="w-6 h-4 border border-yellow-700/50 rounded-sm bg-gradient-to-br from-yellow-200 to-yellow-400" />
          </div>
        </div>

        <div className="mt-10 mb-2">
          <p className="font-mono text-sm text-accent-foreground/80 tracking-[0.3em]">
            {cardNumber
              ? cardNumber.replace(/(.{4})/g, "$1 ").trim() ||
                "•••• •••• •••• ••••"
              : "•••• •••• •••• ••••"}
          </p>
        </div>

        <div className="flex justify-between items-end">
          <div>
            <p className="text-xs text-accent-foreground/50 uppercase tracking-wider">
              Card Holder
            </p>
            <p className="text-sm text-accent-foreground/80 font-bold tracking-wide">
              NAME
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-accent-foreground/50 uppercase tracking-wider">
              Valid{" "}
            </p>
            <p className="text-sm text-accent-foreground/80 font-bold">12/99</p>
          </div>
        </div>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-background/50 rounded-xl flex items-center justify-center"
          >
            <div className="flex items-center gap-2 text-primary">
              <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              <span className="text-sm font-bold">Reading...</span>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

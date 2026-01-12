import { motion } from "framer-motion";

export default function ATMMachine({ children }) {
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-2 sm:p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-[500px] metal-texture p-6 rounded-3xl shadow-2xl border border-atm-metal/50"
      >
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-b from-atm-metal to-transparent rounded-t-3xl" />
        
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-4 bg-background/50 px-6 py-2 rounded-full">
            <div className="w-3 h-3 rounded-full bg-destructive shadow-lg shadow-destructive/50 animate-pulse" />
            <div
              className="w-3 h-3 rounded-full bg-accent shadow-lg shadow-accent/50 animate-pulse"
              style={{ animationDelay: "0.3s" }}
            />
            <div
              className="w-3 h-3 rounded-full bg-primary shadow-lg shadow-primary/50 animate-pulse"
              style={{ animationDelay: "0.6s" }}
            />
          </div>
        </div>

        <div className="text-center mb-6">
          <div className="inline-block bg-gradient-to-b from-atm-metal to-atm-bezel px-8 py-3 rounded-lg border border-atm-metal/30">
            <h1 className="font-display text-2xl text-primary text-glow tracking-[0.3em]">
              SECURE BANK
            </h1>
            <p className="text-xs text-muted-foreground mt-1 tracking-wider">
              24/7 AUTOMATED TELLER MACHINE
            </p>
          </div>
        </div>

        {children}
   <div className="mt-6 flex flex-col items-center">
          <div className="w-full max-w-xs bg-gradient-to-b from-atm-bezel to-background p-4 rounded-xl border border-atm-metal/30">
            <p className="text-xs text-primary mb-2 tracking-wider text-center font-bold">
              ▼ INSERT CARD HERE ▼
            </p>
            <div className="relative">
              <div className="w-full h-4 bg-atm-slot rounded shadow-inner border border-atm-metal/20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-1 bg-primary/30 rounded" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center">
          <div className="w-full max-w-sm bg-gradient-to-b from-background to-atm-slot p-4 rounded-xl border border-atm-metal/20">
            <p className="text-xs text-muted-foreground mb-2 tracking-wider text-center">
              CASH DISPENSER
            </p>
            <div className="w-full h-8 bg-atm-slot rounded-lg shadow-[inset_0_4px_8px_rgba(0,0,0,0.5)] border border-atm-metal/10 flex items-center justify-center">
              <div className="w-3/4 h-0.5 bg-atm-metal/30 rounded" />
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-col items-center">
          <p className="text-xs text-muted-foreground mb-2 tracking-wider">
            RECEIPT
          </p>
          <div className="w-40 h-3 bg-atm-slot rounded shadow-inner border border-atm-metal/20" />
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground/50">
            For support call: 1-800-SECURE-BANK
          </p>
          <p className="text-xs text-primary/30 mt-1">
            ★ PROTECTED BY 256-BIT ENCRYPTION ★
          </p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-t from-atm-metal to-transparent rounded-b-3xl" />
      </motion.div>
    </div>
  );
}

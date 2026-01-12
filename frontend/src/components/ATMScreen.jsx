import { useState, useEffect } from "react";

export default function ATMScreen({ children, title }) {
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full max-w-[420px] mx-auto">
      <div className="bg-gradient-to-br from-atm-bezel via-atm-metal to-atm-bezel p-3 rounded-2xl shadow-2xl border border-atm-metal/50">
        
        <div className="relative bg-gradient-to-b from-muted/30 to-background p-3 rounded-xl border border-atm-metal/30">
          
          {['top-2 left-2', 'top-2 right-2', 'bottom-2 left-2', 'bottom-2 right-2'].map((pos, i) => (
            <div 
              key={i}
              className={`absolute ${pos} w-4 h-4 rounded-full bg-atm-metal shadow-inner border border-atm-metal/50 flex items-center justify-center`}
            >
              <div className="w-2 h-0.5 bg-background/30 rotate-45" />
            </div>
          ))}

          <div className="relative bg-atm-screen rounded-lg overflow-hidden border-2 border-primary/30 shadow-[inset_0_0_50px_rgba(0,0,0,0.9)]">
            
            <div className="absolute inset-0 screen-scanlines pointer-events-none z-10" />
            
            <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-primary/5 pointer-events-none" />
            
            <div className="absolute inset-0 shadow-[inset_0_0_100px_30px_rgba(0,0,0,0.8)] pointer-events-none z-10" />

            {title && (
              <div className="border-b border-primary/40 px-4 py-3 bg-gradient-to-r from-primary/10 via-primary/20 to-primary/10">
                <h1 className="font-display text-lg text-primary text-glow text-center tracking-wider">
                  {title}
                </h1>
              </div>
            )}

            <div className="p-6 min-h-[280px] flex flex-col">
              {children}
            </div>

            <div className="border-t border-primary/30 px-4 py-2 flex items-center justify-between text-xs bg-background/30">
              <span className="flex items-center gap-2 text-primary">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-lg shadow-primary/50" />
                <span className="tracking-wider">SECURE CONNECTION</span>
              </span>
              <span className="text-muted-foreground font-mono">{currentTime}</span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

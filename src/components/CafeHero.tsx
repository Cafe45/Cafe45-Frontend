'use client';

export default function CafeHero() {
  return (
    <section className="relative w-full h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden bg-white">

      {/* 1. BAKGRUNDSMÖNSTER (Fixad Zoom) */}
      <div
        className="absolute inset-0 opacity-[0.18] pointer-events-none"
        style={{
          backgroundImage: "url('/cafe-pattern.png')",
          backgroundRepeat: 'repeat',
          backgroundSize: '450px auto',
          backgroundPosition: 'center top'
        }}
      />

      {/* Toning */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-white/90 pointer-events-none"></div>

      {/* 2. LOGOTYP & TEXT */}
      <div className="relative z-10 text-center pt-10 select-none">
        <h1 className="flex items-baseline justify-center leading-none text-black">

          {/* Ordet "Café" */}
          <span
            className="font-black tracking-tighter text-[clamp(5rem,18vw,11rem)]"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            Café
          </span>

          <span className="w-4 md:w-8" />

          {/* SIFFRAN "4" */}
          <span
            className="blink-four font-black text-[clamp(5rem,18vw,11rem)] outline-text"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            4
          </span>

          {/* SIFFRAN "5" */}
          <span
            className="blink-five font-black text-[clamp(5rem,18vw,11rem)] outline-text"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            5
          </span>
        </h1>
      </div>

      {/* 3. CSS (Fixad tjocklek och glow) */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@900&family=Poppins:wght@900&display=swap');

        /* Standardläge: Genomskinlig med TJOCK svart kant - Base styles */
        .outline-text {
          color: transparent;
          -webkit-text-stroke: 3px #000000; 
          paint-order: stroke fill;
        }

        /* Animation för siffran 4 */
        @keyframes glow-red-four {
          0%, 45% {
            color: #dc2626;
            opacity: 1;
            filter: drop-shadow(0 0 12px rgba(220, 38, 38, 0.8)) drop-shadow(0 0 24px rgba(220, 38, 38, 0.4));
            transform: scale(1.02);
            -webkit-text-stroke: 3px #000000;
          }
          50%, 100% {
            color: rgba(0, 0, 0, 0);
            opacity: 1;
            filter: drop-shadow(0 0 0 transparent);
            transform: scale(1);
            -webkit-text-stroke: 3px #000000;
          }
        }

        /* Animation för siffran 5 */
        @keyframes glow-red-five {
          0%, 50% {
            color: rgba(0, 0, 0, 0);
            opacity: 1;
            filter: drop-shadow(0 0 0 transparent);
            transform: scale(1);
            -webkit-text-stroke: 3px #000000;
          }
          55%, 95% {
            color: #dc2626;
            opacity: 1;
            filter: drop-shadow(0 0 12px rgba(220, 38, 38, 0.8)) drop-shadow(0 0 24px rgba(220, 38, 38, 0.4));
            transform: scale(1.02);
            -webkit-text-stroke: 3px #000000;
          }
          100% {
            color: rgba(0, 0, 0, 0);
            opacity: 1;
            filter: drop-shadow(0 0 0 transparent);
            transform: scale(1);
            -webkit-text-stroke: 3px #000000;
          }
        }

        /* Mobilanpassning - overrides */
        @media (max-width: 768px) {
          .outline-text { -webkit-text-stroke: 2px black; }
          /* Vi behåller animationens stroke på 3px eller minskar den om det behövs, men följer user request exakt för animationen */
        }

        .blink-four {
          animation: glow-red-four 2s ease-in-out infinite;
          transition: all 0.3s ease;
        }

        .blink-five {
          animation: glow-red-five 2s ease-in-out infinite;
          transition: all 0.3s ease;
        }
      `}</style>
    </section>
  );
}
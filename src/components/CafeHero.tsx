'use client';

export default function CafeHero() {
  return (
    <section className="relative w-full h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden bg-white">
      
      {/* 1. BAKGRUNDSMÖNSTER (Fixad Zoom) */}
      <div 
        className="absolute inset-0 opacity-[0.15] pointer-events-none"
        style={{
          backgroundImage: "url('/cafe-pattern.png')",
          backgroundRepeat: 'repeat',
          // ÄNDRING: Ökade från 400px till 650px för att zooma in mönstret som i Figma
          backgroundSize: '650px auto', 
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

        /* Standardläge: Genomskinlig med TJOCK svart kant */
        .outline-text {
          color: transparent;
          /* ÄNDRING: Ökade kantens tjocklek till 4px för att matcha Figma */
          -webkit-text-stroke: 4px black; 
          paint-order: stroke fill;
        }

        /* Animationen: Tydligare röd färg och skarpare övergång */
        @keyframes flash-red {
          0%, 35% {
            color: transparent;
            -webkit-text-stroke: 4px black;
            text-shadow: none;
            transform: scale(1);
          }
          40%, 50% {
            color: #dc2626; /* Röd */
            -webkit-text-stroke: 0px transparent; /* Ingen kant när den är röd */
            /* ÄNDRING: Starkare glow som i Figma */
            text-shadow: 0 0 50px rgba(220, 38, 38, 0.8); 
            transform: scale(1.02);
          }
          55%, 100% {
            color: transparent;
            -webkit-text-stroke: 4px black;
            text-shadow: none;
            transform: scale(1);
          }
        }

        /* Mobilanpassning: Lite tunnare kant på små skärmar */
        @media (max-width: 768px) {
          .outline-text { -webkit-text-stroke: 2px black; }
          @keyframes flash-red {
             0%, 35% { -webkit-text-stroke: 2px black; }
             55%, 100% { -webkit-text-stroke: 2px black; }
          }
        }

        .blink-four {
          animation: flash-red 3s ease-in-out infinite;
          animation-delay: 0s;
        }

        .blink-five {
          animation: flash-red 3s ease-in-out infinite;
          animation-delay: 1.5s;
        }
      `}</style>
    </section>
  );
}
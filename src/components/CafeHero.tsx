'use client';

export default function CafeHero() {
  return (
    <section className="relative w-full h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden bg-white">

      {/* 1. BAKGRUNDSMÖNSTER */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: "url('/images/cafe-pattern.png')",
          backgroundRepeat: 'repeat',
          backgroundSize: '600px auto', // Lite mindre än 800 så vi får mer mönster
          backgroundPosition: 'center top',
          
          // HÄR ÄR TRICKET:
          opacity: 0.4,           // Gör den svagare (ljusgrå) så linjerna inte syns lika väl
          filter: 'blur(1.5px)',  // Gör den lite suddig - döljer skarvarna och ger fokus till texten
        }}
      />

      {/* 2. LOGOTYP & TEXT */}
      <div className="relative z-10 text-center select-none">
        <div>
          <h1 className="flex items-baseline justify-center leading-none text-black drop-shadow-2xl">

            {/* Ordet "Café" */}
            <span
              className="font-black tracking-tighter text-[clamp(6rem,20vw,13rem)] mr-4"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              Café
            </span>

            {/* SIFFRAN "4" */}
            <span
              className="blink-four font-black text-[clamp(6rem,20vw,13rem)] outline-text"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              4
            </span>

            {/* SIFFRAN "5" */}
            <span
              className="blink-five font-black text-[clamp(6rem,20vw,13rem)] outline-text"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              5
            </span>
          </h1>
        </div>
      </div>

      {/* 3. CSS */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@900&family=Poppins:wght@900&display=swap');
        
        .outline-text { 
          color: #ffffff; 
          -webkit-text-stroke: 3px #000000; 
          paint-order: stroke fill; 
        }
        
        @keyframes glow-red-four {
          0%, 45% { 
            color: #dc2626; 
            opacity: 1; 
            filter: drop-shadow(0 0 20px rgba(220, 38, 38, 0.8));
            transform: scale(1.02); 
            -webkit-text-stroke: 3px #dc2626; 
          }
          50%, 100% { 
            color: #ffffff; 
            transform: scale(1); 
            -webkit-text-stroke: 3px #000000; 
          }
        }
        
        @keyframes glow-red-five {
          0%, 50% { 
            color: #ffffff; 
            transform: scale(1); 
            -webkit-text-stroke: 3px #000000; 
          }
          55%, 95% { 
            color: #dc2626; 
            opacity: 1; 
            filter: drop-shadow(0 0 20px rgba(220, 38, 38, 0.8));
            transform: scale(1.02); 
            -webkit-text-stroke: 3px #dc2626; 
          }
          100% { 
            color: #ffffff; 
            transform: scale(1); 
            -webkit-text-stroke: 3px #000000; 
          }
        }
        
        @media (max-width: 768px) { .outline-text { -webkit-text-stroke: 2px black; } }
        .blink-four { animation: glow-red-four 2s ease-in-out infinite; }
        .blink-five { animation: glow-red-five 2s ease-in-out infinite; }
      `}</style>
    </section>
  );
}
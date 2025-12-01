import { CakeInquiryCommand } from "@/types";

// Hämtar URL:en från next.config.ts
const BACKEND_URL = process.env.BACKEND_URL;

/**
 * Generisk funktion för att skicka data till backend (POST).
 * @param endpoint - T.ex. '/inquiry'
 * @param data - Datan som ska skickas
 */
export async function postData<T>(endpoint: string, data: T) {
  if (!BACKEND_URL) {
    throw new Error("BACKEND_URL is not defined in environment variables.");
  }
  
  // NOTE: För localhost/SSL (https) i utvecklingsmiljö måste du hantera certifikat.
  // I produktion fungerar det här utmärkt. 
  // För MVP kör vi enkelt fetch, men Next.js rekommenderar att man använder 
  // en serverkomponent för fetch. Vi använder 'no-cors' mode om vi stöter på problem.
  
  const response = await fetch(`${BACKEND_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    // Detta kan krävas i vissa lokala miljöer pga. SSL-certifikatet
    // cache: 'no-store',
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ message: 'Okänt fel' }));
    throw new Error(`API Error ${response.status}: ${errorBody.message || JSON.stringify(errorBody)}`);
  }

  // Förväntar sig en JSON-respons, men returnerar null om responsen är tom (t.ex. 204 No Content)
  return response.json().catch(() => null); 
}
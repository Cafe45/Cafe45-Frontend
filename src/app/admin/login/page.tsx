'use client';

import { loginAdmin } from '@/app/actions';
import { useFormState } from 'react-dom'; // Hook för server actions
import { Coffee } from 'lucide-react';

const initialState = {
  error: '',
};

// En liten wrapper för att hantera state med server action
async function handleLogin(prevState: any, formData: FormData) {
    const result = await loginAdmin(formData);
    if (result?.error) {
        return { error: result.error };
    }
    return { error: '' };
}

export default function LoginPage() {
  const [state, formAction] = (useFormState as any)(handleLogin, initialState);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-gray-100 text-center">
        
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center">
            <Coffee className="w-8 h-8" />
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-2">Admin Login</h1>
        <p className="text-gray-500 mb-8">Endast för personal på Café 45</p>

        <form action={formAction} className="space-y-4">
          <div>
            <input 
              type="password" 
              name="password" 
              placeholder="Ange lösenord" 
              className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black transition-all"
              required
            />
          </div>

          {state?.error && (
            <p className="text-red-500 text-sm font-medium animate-pulse">
              ⛔ {state.error}
            </p>
          )}

          <button 
            type="submit" 
            className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-transform active:scale-95"
          >
            Logga in
          </button>
        </form>

        <div className="mt-8 text-xs text-gray-400">
          Tillbaka till <a href="/" className="underline hover:text-black">startsidan</a>
        </div>
      </div>
    </div>
  );
}
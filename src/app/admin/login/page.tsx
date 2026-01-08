'use client';

import { useState } from 'react';
import { toast, Toaster } from 'sonner';
import { Loader2, Coffee } from 'lucide-react';
import { supabase } from '@/lib/supabase'; // Din vanliga client-fil

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error('Fel email eller lösenord');
      setLoading(false);
    } else {
      toast.success('Inloggad!');
      // VIKTIGT: Vi använder window.location.href för att tvinga en omladdning.
      // Detta löser problemet med att admin-sidan tror att man är utloggad.
      window.location.href = '/admin';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 font-sans text-gray-900">
      <Toaster position="top-center" richColors />
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-gray-100 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center">
            <Coffee className="w-8 h-8" />
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-2">Admin Login</h1>
        <form onSubmit={handleLogin} className="space-y-4 mt-8">
          <input 
            type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none" required 
          />
          <input 
            type="password" placeholder="Lösenord" value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none" required 
          />
          <button type="submit" disabled={loading} className="w-full py-4 bg-black text-white font-bold rounded-xl flex justify-center items-center gap-2">
            {loading ? <Loader2 className="animate-spin" /> : 'Logga in'}
          </button>
        </form>
      </div>
    </div>
  );
}
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAdmin(formData: FormData) {
  const password = formData.get('password');

  // HÄR ÄR LÖSENORDET! Byt ut 'kaffe123' till vad du vill.
  const CORRECT_PASSWORD = process.env.ADMIN_PASSWORD || 'kaffe123';

  if (password === CORRECT_PASSWORD) {
    // Sätt en kaka som gäller i 24 timmar
    const cookieStore = await cookies();
    cookieStore.set('admin_session', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 dygn
      path: '/',
    });
    
    redirect('/admin');
  } else {
    // Om fel lösenord
    return { error: 'Fel lösenord' };
  }
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_session');
  redirect('/admin/login');
}
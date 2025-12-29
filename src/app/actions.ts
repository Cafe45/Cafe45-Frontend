'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';

export async function loginAdmin(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'E-post och lösenord krävs' };
  }

  const supabase = await createClient();

  // Sign in with Supabase
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !authData.user) {
    return { error: 'Fel e-post eller lösenord' };
  }

  // Check if user is admin
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', authData.user.id)
    .single();

  if (profileError || !profile || !profile.is_admin) {
    // User is not an admin, sign them out
    await supabase.auth.signOut();
    return { error: 'Du har inte adminbehörighet' };
  }

  // User is authenticated and is admin
  redirect('/admin');
}

export async function logoutAdmin() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/admin/login');
}
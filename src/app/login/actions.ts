'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  
  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  const supabase = await createClient()

  const { error, data } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }
  
  const userId = data.user.id
  
  // Check the official's status
  const { data: official, error: officialError } = await supabase
    .from('officials')
    .select('role, status')
    .eq('id', userId)
    .single()
    
  if (officialError || !official) {
    // If they aren't in the officials table at all, log them out
    await supabase.auth.signOut()
    return { error: 'Access denied. Account not found in official registry.' }
  }
  
  if (official.status === 'pending') {
    redirect('/pending')
  }
  
  if (official.status === 'rejected') {
    redirect('/rejected')
  }

  redirect('/admin')
}

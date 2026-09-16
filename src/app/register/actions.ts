'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function register(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const role = formData.get('role') as string
  const position = formData.get('position') as string

  if (!name || !email || !password || !role) {
    return { error: 'All required fields must be filled.' }
  }

  if (!['secretary', 'kagawad', 'admin'].includes(role)) {
    return { error: 'Invalid role selected.' }
  }

  const supabase = await createClient()

  // Sign up the user in Supabase Auth
  const { error: signUpError, data } = await supabase.auth.signUp({
    email,
    password,
  })

  if (signUpError) {
    return { error: signUpError.message }
  }

  if (data.user) {
    // Use service role client to bypass RLS for the officials insert
    const serviceClient = createServiceClient()
    const { error: insertError } = await serviceClient.from('officials').insert({
      id: data.user.id,
      name,
      role,
      position: position || null,
      status: 'pending',
    })

    if (insertError) {
      return { error: 'Failed to create official profile: ' + insertError.message }
    }
  }

  // Redirect to pending approval page
  redirect('/pending')
}

'use server'

import { redirect } from 'next/navigation'
import { signIn } from '@/auth'
import { AuthError } from 'next-auth'

export async function authenticate(
  prevState: { message: string } | undefined,
  formData: FormData
) {
  try {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
      return { message: 'Email and password are required' }
    }

    await signIn('credentials', {
      email,
      password,
      redirectTo: '/customers', // Direct redirect after successful login
    })

    // This line should never be reached if signIn is successful
    // signIn will redirect automatically
    return { message: 'Login successful' }
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { message: 'Invalid email or password' }
        default:
          return { message: 'An error occurred during login' }
      }
    }
    // NextAuth redirect errors are expected behavior
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      redirect('/customers')
    }
    throw error
  }
}

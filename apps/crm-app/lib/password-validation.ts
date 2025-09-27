export interface PasswordValidationResult {
  isValid: boolean
  errors: string[]
  strength: 'weak' | 'medium' | 'strong'
}

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = []

  // Minimum length check
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }

  // Check for uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  // Check for lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  // Check for number
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  // Check for special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }

  // Calculate strength
  let strength: 'weak' | 'medium' | 'strong' = 'weak'

  if (errors.length === 0 && password.length >= 12) {
    strength = 'strong'
  } else if (errors.length <= 2) {
    strength = 'medium'
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength,
  }
}

// For production use - more strict validation
export function validatePasswordStrict(
  password: string
): PasswordValidationResult {
  return validatePassword(password)
}

// For development/demo - relaxed validation (current behavior)
export function validatePasswordRelaxed(
  password: string
): PasswordValidationResult {
  const errors: string[] = []

  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long')
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength: password.length >= 8 ? 'medium' : 'weak',
  }
}

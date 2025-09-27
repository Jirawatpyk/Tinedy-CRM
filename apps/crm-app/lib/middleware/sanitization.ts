/**
 * Sanitizes string input to prevent XSS attacks
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return input

  // Remove potentially dangerous content without using DOMPurify
  let cleaned = input
    // Remove script tags and content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove event handlers (onclick, onerror, etc.)
    .replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
    // Remove javascript: protocol
    .replace(/javascript:/gi, '')
    // Remove HTML tags
    .replace(/<[^>]+>/g, '')
    // Remove dangerous SQL characters
    .replace(/['";\\]/g, '')
    // Remove other dangerous patterns
    .replace(/(<|>|&lt;|&gt;|&#)/g, '')
    .trim()

  return cleaned
}

/**
 * Sanitizes phone number to Thai format
 */
export function sanitizePhoneNumber(phone: string): string {
  if (typeof phone !== 'string') return phone

  // Remove all non-digit characters except +
  let cleaned = phone.replace(/[^\d+]/g, '')

  // Convert Thai format variants to standard
  if (cleaned.startsWith('0')) {
    cleaned = '+66' + cleaned.substring(1)
  } else if (cleaned.startsWith('66') && !cleaned.startsWith('+66')) {
    cleaned = '+' + cleaned
  }

  return cleaned
}

/**
 * Validates and sanitizes customer input data
 */
export interface CustomerSanitizationResult {
  data: {
    name?: string
    phone?: string
    address?: string
    contactChannel?: string
  }
  errors: string[]
}

export function sanitizeCustomerInput(input: any): CustomerSanitizationResult {
  const errors: string[] = []
  const data: any = {}

  // Sanitize name
  if (input.name !== undefined) {
    if (typeof input.name !== 'string') {
      errors.push('Name must be a string')
    } else {
      data.name = sanitizeString(input.name)
      if (data.name.length === 0) {
        errors.push('Name cannot be empty after sanitization')
      }
      if (data.name.length > 100) {
        errors.push('Name too long (max 100 characters)')
      }
    }
  }

  // Sanitize phone
  if (input.phone !== undefined) {
    if (typeof input.phone !== 'string') {
      errors.push('Phone must be a string')
    } else {
      data.phone = sanitizePhoneNumber(input.phone)
      // Validate Thai phone format
      if (data.phone && !data.phone.match(/^\+66[0-9]{9}$/)) {
        errors.push('Invalid Thai phone number format')
      }
    }
  }

  // Sanitize address
  if (input.address !== undefined) {
    if (typeof input.address !== 'string') {
      errors.push('Address must be a string')
    } else {
      data.address = sanitizeString(input.address)
      if (data.address.length > 500) {
        errors.push('Address too long (max 500 characters)')
      }
    }
  }

  // Sanitize contact channel
  if (input.contactChannel !== undefined) {
    if (typeof input.contactChannel !== 'string') {
      errors.push('Contact channel must be a string')
    } else {
      data.contactChannel = sanitizeString(input.contactChannel)
      const allowedChannels = ['LINE', 'Phone', 'Email', 'Facebook', 'Walk-in']
      if (
        data.contactChannel &&
        !allowedChannels.includes(data.contactChannel)
      ) {
        errors.push(
          `Contact channel must be one of: ${allowedChannels.join(', ')}`
        )
      }
    }
  }

  return { data, errors }
}

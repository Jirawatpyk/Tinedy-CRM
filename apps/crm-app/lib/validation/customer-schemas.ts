import { z } from 'zod'

// Thai phone number validation
const thaiPhoneRegex = /^(\+66|0)[0-9]{9}$/

// Thai name validation (allow Thai, English, spaces, common punctuation)
const thaiNameRegex = /^[ก-๙a-zA-Z\s\.\-']+$/

export const customerCreateSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .regex(thaiNameRegex, 'Name contains invalid characters')
    .transform((str) => str.trim()),

  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(thaiPhoneRegex, 'Invalid Thai phone number format')
    .transform((phone) => {
      // Normalize phone format to +66 format
      if (phone.startsWith('0')) {
        return '+66' + phone.substring(1)
      }
      return phone
    }),

  address: z
    .string()
    .max(500, 'Address must be less than 500 characters')
    .optional()
    .transform((str) => str?.trim() || null),

  contactChannel: z
    .enum(['LINE', 'Phone', 'Email', 'Facebook', 'Walk-in'])
    .refine(
      val => ['LINE', 'Phone', 'Email', 'Facebook', 'Walk-in'].includes(val),
      {
        message:
          'Contact channel must be one of: LINE, Phone, Email, Facebook, Walk-in',
      }
    ),
})

export const customerUpdateSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .regex(thaiNameRegex, 'Name contains invalid characters')
    .transform((str) => str.trim())
    .optional(),

  phone: z
    .string()
    .regex(thaiPhoneRegex, 'Invalid Thai phone number format')
    .transform((phone) => {
      if (phone.startsWith('0')) {
        return '+66' + phone.substring(1)
      }
      return phone
    })
    .optional(),

  address: z
    .string()
    .max(500, 'Address must be less than 500 characters')
    .transform((str) => str?.trim() || null)
    .optional(),

  contactChannel: z
    .enum(['LINE', 'Phone', 'Email', 'Facebook', 'Walk-in'])
    .refine(
      val => ['LINE', 'Phone', 'Email', 'Facebook', 'Walk-in'].includes(val),
      {
        message:
          'Contact channel must be one of: LINE, Phone, Email, Facebook, Walk-in',
      }
    )
    .optional(),
})

export const customerQuerySchema = z.object({
  q: z.string().max(100, 'Search query too long').optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'BLOCKED']).optional(),
  page: z.coerce.number().int().min(1).max(1000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z
    .enum(['name', 'phone', 'createdAt', 'updatedAt', 'status'])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export const customerIdSchema = z.object({
  id: z.string().uuid('Invalid customer ID format'),
})

// Type exports for TypeScript
export type CustomerCreateInput = z.infer<typeof customerCreateSchema>
export type CustomerUpdateInput = z.infer<typeof customerUpdateSchema>
export type CustomerQueryInput = z.infer<typeof customerQuerySchema>
export type CustomerIdInput = z.infer<typeof customerIdSchema>

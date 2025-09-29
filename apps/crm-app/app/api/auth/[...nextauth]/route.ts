import { handlers } from '@/auth'

// Temporarily disable rate limiting for testing
// TODO: Re-enable rate limiting for production
export const GET = handlers.GET
export const POST = handlers.POST

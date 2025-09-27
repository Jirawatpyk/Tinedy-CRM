import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { UserRole } from '@prisma/client'
import { z } from 'zod'
import { sanitizeCustomerInput } from '@/lib/middleware/sanitization'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // ตรวจสอบ authentication
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ตรวจสอบ role permission (Admin only)
    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    const { id } = params

    // Find customer by ID
    const customer = await prisma.customer.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        phone: true,
        address: true,
        contactChannel: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    return NextResponse.json(customer)
  } catch (error) {
    console.error('Error fetching customer:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // ตรวจสอบ authentication
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ตรวจสอบ role permission (Admin only)
    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    const { id } = params

    // Check if customer exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { id },
    })

    if (!existingCustomer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Parse request body
    const body = await request.json()
    const { name, phone, address, contactChannel } = body

    // Validate fields if provided
    const errors: Record<string, string> = {}

    if (
      name !== undefined &&
      (!name || typeof name !== 'string' || name.trim().length === 0)
    ) {
      errors.name = 'Name is required'
    }

    if (
      phone !== undefined &&
      (!phone || typeof phone !== 'string' || phone.trim().length === 0)
    ) {
      errors.phone = 'Phone number is required'
    }

    if (
      contactChannel !== undefined &&
      (!contactChannel ||
        typeof contactChannel !== 'string' ||
        contactChannel.trim().length === 0)
    ) {
      errors.contactChannel = 'Contact channel is required'
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', errors },
        { status: 400 }
      )
    }

    // Check phone uniqueness if phone is being updated
    if (phone && phone.trim() !== existingCustomer.phone) {
      const phoneConflict = await prisma.customer.findUnique({
        where: { phone: phone.trim() },
      })

      if (phoneConflict) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            errors: { phone: 'Phone number already exists' },
          },
          { status: 400 }
        )
      }
    }

    // Prepare update data
    const updateData: any = {}

    if (name !== undefined) updateData.name = name.trim()
    if (phone !== undefined) updateData.phone = phone.trim()
    if (address !== undefined) updateData.address = address?.trim() || null
    if (contactChannel !== undefined)
      updateData.contactChannel = contactChannel.trim()

    // Update customer
    const customer = await prisma.customer.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(customer)
  } catch (error) {
    console.error('Error updating customer:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

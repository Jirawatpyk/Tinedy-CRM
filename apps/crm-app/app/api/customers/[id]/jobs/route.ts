import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { JobService } from '@/lib/services/job'
import { CustomerService } from '@/lib/services/customer'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // ตรวจสอบ authentication
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ตรวจสอบ authorization (Admin role required)
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin role required' },
        { status: 403 }
      )
    }

    const customerId = params.id

    // ตรวจสอบว่าลูกค้ามีอยู่จริง
    const customer = await CustomerService.getCustomerById(customerId)
    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // ดึงพารามิเตอร์สำหรับ pagination
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100) // จำกัดสูงสุด 100

    // ตรวจสอบค่า page และ limit
    if (page < 1) {
      return NextResponse.json(
        { error: 'Page must be greater than 0' },
        { status: 400 }
      )
    }

    if (limit < 1) {
      return NextResponse.json(
        { error: 'Limit must be greater than 0' },
        { status: 400 }
      )
    }

    // ดึงข้อมูลงานของลูกค้า
    const result = await JobService.getJobsByCustomerId(customerId, page, limit)

    // ส่งข้อมูลกลับ
    return NextResponse.json({
      success: true,
      data: {
        jobs: result.jobs,
        pagination: {
          page,
          limit,
          totalCount: result.totalCount,
          totalPages: Math.ceil(result.totalCount / limit),
          hasNextPage: result.hasNextPage,
          hasPreviousPage: page > 1,
        },
      },
    })
  } catch (error) {
    console.error('Error fetching customer jobs:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'Failed to fetch customer jobs',
      },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // ตรวจสอบ authentication
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ตรวจสอบ authorization (Admin role required)
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin role required' },
        { status: 403 }
      )
    }

    const customerId = params.id

    // ตรวจสอบว่าลูกค้ามีอยู่จริง
    const customer = await CustomerService.getCustomerById(customerId)
    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // รับข้อมูลจาก request body
    const body = await request.json()
    const { serviceType, scheduledDate, price, notes, assignedUserId } = body

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!serviceType) {
      return NextResponse.json(
        { error: 'Service type is required' },
        { status: 400 }
      )
    }

    if (!scheduledDate) {
      return NextResponse.json(
        { error: 'Scheduled date is required' },
        { status: 400 }
      )
    }

    if (price === undefined || price === null) {
      return NextResponse.json({ error: 'Price is required' }, { status: 400 })
    }

    if (typeof price !== 'number' || price < 0) {
      return NextResponse.json(
        { error: 'Price must be a positive number' },
        { status: 400 }
      )
    }

    // ตรวจสอบว่า serviceType ถูกต้อง
    const validServiceTypes = ['CLEANING', 'TRAINING']
    if (!validServiceTypes.includes(serviceType)) {
      return NextResponse.json(
        { error: 'Invalid service type' },
        { status: 400 }
      )
    }

    // สร้างงานใหม่
    const newJob = await JobService.createJob({
      customerId,
      serviceType,
      scheduledDate: new Date(scheduledDate),
      price,
      notes,
      assignedUserId: assignedUserId || undefined,
    })

    // ดึงข้อมูลงานที่สร้างพร้อม relations
    const createdJob = await JobService.getJobById(newJob.id)

    return NextResponse.json(
      {
        success: true,
        data: createdJob,
        message: 'Job created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating job:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'Failed to create job',
      },
      { status: 500 }
    )
  }
}

import { prisma } from '@/lib/db'
import { Customer, CustomerStatus } from '@prisma/client'

export interface CustomerCreateInput {
  name: string
  phone: string
  address?: string
  contactChannel: string
}

export interface CustomerUpdateInput {
  name?: string
  phone?: string
  address?: string
  contactChannel?: string
  status?: CustomerStatus
}

export class CustomerService {
  /**
   * ดึงรายการลูกค้าทั้งหมด
   */
  static async getAllCustomers(): Promise<Customer[]> {
    return await prisma.customer.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  /**
   * ค้นหาลูกค้าตาม ID
   */
  static async getCustomerById(id: string): Promise<Customer | null> {
    return await prisma.customer.findUnique({
      where: { id },
    })
  }

  /**
   * ค้นหาลูกค้าตามเบอร์โทรศัพท์
   */
  static async getCustomerByPhone(phone: string): Promise<Customer | null> {
    return await prisma.customer.findFirst({
      where: { phone },
    })
  }

  /**
   * ค้นหาลูกค้าตาม Contact Channel
   */
  static async getCustomerByContactChannel(
    contactChannel: string
  ): Promise<Customer[]> {
    return await prisma.customer.findMany({
      where: { contactChannel },
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  /**
   * สร้างลูกค้าใหม่
   */
  static async createCustomer(data: CustomerCreateInput): Promise<Customer> {
    return await prisma.customer.create({
      data: {
        ...data,
        status: CustomerStatus.ACTIVE,
      },
    })
  }

  /**
   * อัปเดตข้อมูลลูกค้า
   */
  static async updateCustomer(
    id: string,
    data: CustomerUpdateInput
  ): Promise<Customer> {
    return await prisma.customer.update({
      where: { id },
      data,
    })
  }

  /**
   * ลบลูกค้า (soft delete - เปลี่ยนสถานะเป็น INACTIVE)
   */
  static async deactivateCustomer(id: string): Promise<Customer> {
    return await prisma.customer.update({
      where: { id },
      data: { status: CustomerStatus.INACTIVE },
    })
  }

  /**
   * ค้นหาลูกค้าตามชื่อและเบอร์โทรศัพท์
   */
  static async searchCustomers(query: string): Promise<Customer[]> {
    return await prisma.customer.findMany({
      where: {
        OR: [
          {
            name: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            phone: {
              contains: query,
            },
          },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  }
}

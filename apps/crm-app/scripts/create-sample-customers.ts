import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createSampleCustomers() {
  console.log('🏢 Creating sample customers...')

  try {
    // Create sample customers
    const customers = [
      {
        name: 'บริษัท เทสต์ จำกัด',
        phone: '+66812345678',
        address: '123 ถนนเทสต์ เขตเทสต์ กรุงเทพฯ 10100',
        contactChannel: 'LINE' as const,
      },
      {
        name: 'บริษัท ตัวอย่าง จำกัด',
        phone: '+66823456789',
        address: '456 ถนนตัวอย่าง เขตตัวอย่าง กรุงเทพฯ 10200',
        contactChannel: 'Phone' as const,
      },
      {
        name: 'ห้างหุ้นส่วน ดีมอล',
        phone: '+66834567890',
        address: '789 ถนนดีมอล เขตดีมอล กรุงเทพฯ 10300',
        contactChannel: 'Email' as const,
      }
    ]

    for (const customerData of customers) {
      // Check if customer already exists
      const existing = await prisma.customer.findUnique({
        where: { phone: customerData.phone }
      })

      if (!existing) {
        await prisma.customer.create({
          data: customerData
        })
        console.log(`✅ Created customer: ${customerData.name}`)
      } else {
        console.log(`⚠️  Customer already exists: ${customerData.name}`)
      }
    }

    console.log('🎉 Sample customers created successfully!')

  } catch (error) {
    console.error('❌ Error creating sample customers:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createSampleCustomers()
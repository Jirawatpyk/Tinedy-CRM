import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'Customers API endpoint' })
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ message: 'Create customer endpoint' })
}

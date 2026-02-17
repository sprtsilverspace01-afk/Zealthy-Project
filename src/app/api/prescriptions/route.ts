import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const patientId = searchParams.get('patientId')
  
  try {
    const prescriptions = await prisma.prescription.findMany({
      where: patientId ? { patientId } : {},
      include: { patient: true },
      orderBy: { refillDate: 'asc' }
    })
    return NextResponse.json(prescriptions)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch prescriptions' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const prescription = await prisma.prescription.create({
      data: {
        ...body,
        refillDate: new Date(body.refillDate)
      }
    })
    return NextResponse.json(prescription, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create prescription' }, { status: 500 })
  }
}

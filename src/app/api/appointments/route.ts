import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const patientId = searchParams.get('patientId')
  
  try {
    const appointments = await prisma.appointment.findMany({
      where: patientId ? { patientId } : {},
      include: { patient: true },
      orderBy: { dateTime: 'asc' }
    })
    return NextResponse.json(appointments)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const appointment = await prisma.appointment.create({
      data: {
        ...body,
        dateTime: new Date(body.dateTime),
        endDate: body.endDate ? new Date(body.endDate) : null
      }
    })
    return NextResponse.json(appointment, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 })
  }
}

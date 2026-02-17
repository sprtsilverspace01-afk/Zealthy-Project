import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const patients = await prisma.patient.findMany({
      include: {
        appointments: true,
        prescriptions: true
      },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(patients)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch patients' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const hashedPassword = await bcrypt.hash(body.password, 10)
    
    const patient = await prisma.patient.create({
      data: {
        ...body,
        password: hashedPassword,
        dateOfBirth: new Date(body.dateOfBirth)
      }
    })
    
    return NextResponse.json(patient, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create patient' }, { status: 500 })
  }
}

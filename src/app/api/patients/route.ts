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

    // Validate required fields
    if (!body.firstName || !body.lastName || !body.email || !body.password || !body.dateOfBirth || !body.phone || !body.address) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if patient with this email already exists
    const existingPatient = await prisma.patient.findUnique({
      where: { email: body.email }
    })

    if (existingPatient) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(body.password, 10)
    
    const patient = await prisma.patient.create({
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        password: hashedPassword,
        dateOfBirth: new Date(body.dateOfBirth),
        phone: body.phone,
        address: body.address
      }
    })
    
    return NextResponse.json({
      id: patient.id,
      firstName: patient.firstName,
      lastName: patient.lastName,
      email: patient.email,
      message: 'Patient registered successfully'
    }, { status: 201 })
  } catch (error: any) {
    console.error('Patient creation error:', error)
    return NextResponse.json({ 
      error: 'Failed to create patient',
      details: error.message 
    }, { status: 500 })
  }
}

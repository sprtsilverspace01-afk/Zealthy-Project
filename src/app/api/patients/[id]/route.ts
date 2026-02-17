import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const patient = await prisma.patient.findUnique({
      where: { id: params.id },
      include: {
        appointments: { orderBy: { dateTime: 'asc' } },
        prescriptions: { orderBy: { refillDate: 'asc' } }
      }
    })
    
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }
    
    return NextResponse.json(patient)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch patient' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const updateData: any = { ...body }
    
    if (body.password) {
      updateData.password = await bcrypt.hash(body.password, 10)
    }
    
    if (body.dateOfBirth) {
      updateData.dateOfBirth = new Date(body.dateOfBirth)
    }
    
    const patient = await prisma.patient.update({
      where: { id: params.id },
      data: updateData
    })
    
    return NextResponse.json(patient)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update patient' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.patient.delete({
      where: { id: params.id }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete patient' }, { status: 500 })
  }
}

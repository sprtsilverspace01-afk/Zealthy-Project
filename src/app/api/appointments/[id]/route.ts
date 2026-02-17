import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const appointment = await prisma.appointment.update({
      where: { id: params.id },
      data: {
        ...body,
        dateTime: body.dateTime ? new Date(body.dateTime) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : null
      }
    })
    return NextResponse.json(appointment)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.appointment.delete({
      where: { id: params.id }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete appointment' }, { status: 500 })
  }
}

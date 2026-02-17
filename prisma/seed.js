const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  // Clear existing data
  await prisma.prescription.deleteMany()
  await prisma.appointment.deleteMany()
  await prisma.patient.deleteMany()

  // Create patients with hashed passwords
  const patient1 = await prisma.patient.create({
    data: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: await bcrypt.hash('password123', 10),
      dateOfBirth: new Date('1985-05-15'),
      phone: '555-0101',
      address: '123 Main St, Springfield, IL 62701'
    }
  })

  const patient2 = await prisma.patient.create({
    data: {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      password: await bcrypt.hash('password123', 10),
      dateOfBirth: new Date('1990-08-22'),
      phone: '555-0102',
      address: '456 Oak Ave, Springfield, IL 62702'
    }
  })

  // Create appointments
  await prisma.appointment.createMany({
    data: [
      {
        patientId: patient1.id,
        providerName: 'Dr. Sarah Johnson',
        dateTime: new Date('2024-12-20T10:00:00'),
        repeatSchedule: 'Monthly',
        endDate: new Date('2025-06-20'),
        reason: 'Regular checkup'
      },
      {
        patientId: patient1.id,
        providerName: 'Dr. Michael Chen',
        dateTime: new Date('2024-12-25T14:30:00'),
        repeatSchedule: null,
        endDate: null,
        reason: 'Follow-up consultation'
      },
      {
        patientId: patient2.id,
        providerName: 'Dr. Emily Rodriguez',
        dateTime: new Date('2024-12-22T09:00:00'),
        repeatSchedule: 'Weekly',
        endDate: new Date('2025-03-22'),
        reason: 'Physical therapy'
      }
    ]
  })

  // Create prescriptions
  await prisma.prescription.createMany({
    data: [
      {
        patientId: patient1.id,
        medicationName: 'Lisinopril',
        dosage: '10mg',
        quantity: 30,
        refillDate: new Date('2024-12-18'),
        refillSchedule: 'Monthly'
      },
      {
        patientId: patient1.id,
        medicationName: 'Metformin',
        dosage: '500mg',
        quantity: 60,
        refillDate: new Date('2024-12-21'),
        refillSchedule: 'Monthly'
      },
      {
        patientId: patient2.id,
        medicationName: 'Levothyroxine',
        dosage: '75mcg',
        quantity: 30,
        refillDate: new Date('2024-12-19'),
        refillSchedule: 'Monthly'
      },
      {
        patientId: patient2.id,
        medicationName: 'Atorvastatin',
        dosage: '20mg',
        quantity: 30,
        refillDate: new Date('2025-01-15'),
        refillSchedule: 'Monthly'
      }
    ]
  })

  console.log('Database seeded successfully!')
  console.log('\nTest credentials:')
  console.log('Email: john.doe@example.com | Password: password123')
  console.log('Email: jane.smith@example.com | Password: password123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

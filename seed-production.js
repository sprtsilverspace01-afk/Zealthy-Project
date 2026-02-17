// Run this with: node seed-production.js
// Make sure to set DATABASE_URL environment variable first

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding production database...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  await prisma.patient.createMany({
    data: [
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: hashedPassword,
        dateOfBirth: new Date('1990-01-15'),
        phone: '555-0101',
        address: '123 Main St, City, State 12345',
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        password: hashedPassword,
        dateOfBirth: new Date('1985-05-20'),
        phone: '555-0102',
        address: '456 Oak Ave, City, State 12345',
      },
    ],
  });

  console.log('✅ Production database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

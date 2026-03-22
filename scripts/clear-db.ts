import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearDatabase() {
  try {
    console.log('🗑️  Clearing database...');

    await prisma.attendance.deleteMany({});
    await prisma.session.deleteMany({});
    await prisma.paymentTransaction.deleteMany({});
    await prisma.paymentMonth.deleteMany({});
    await prisma.teacherPayment.deleteMany({});
    await prisma.enrollment.deleteMany({});
    await prisma.packClass.deleteMany({});
    await prisma.pack.deleteMany({});
    await prisma.class.deleteMany({});
    await prisma.student.deleteMany({});
    await prisma.teacher.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.school.deleteMany({});

    console.log('✅ Database cleared successfully!');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

clearDatabase();

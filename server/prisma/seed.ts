import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminHash = await bcrypt.hash('admin123', 12);
  const donorHash = await bcrypt.hash('donor123', 12);
  const studentHash = await bcrypt.hash('student123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@giveabuck.org' },
    update: {},
    create: { email: 'admin@giveabuck.org', name: 'Admin', passwordHash: adminHash, role: 'ADMIN' },
  });

  const donor1 = await prisma.user.upsert({
    where: { email: 'jane@example.com' },
    update: {},
    create: { email: 'jane@example.com', name: 'Jane Smith', passwordHash: donorHash, role: 'DONOR' },
  });

  const donor2 = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: { email: 'bob@example.com', name: 'Bob Chen', passwordHash: donorHash, role: 'DONOR' },
  });

  const student1 = await prisma.user.upsert({
    where: { email: 'alex@example.com' },
    update: {},
    create: {
      email: 'alex@example.com', name: 'Alex Rivera', passwordHash: studentHash,
      role: 'STUDENT', school: 'University of Michigan', major: 'Computer Science',
    },
  });

  const scholarship1 = await prisma.scholarship.upsert({
    where: { id: 'scholarship-1' },
    update: {},
    create: {
      id: 'scholarship-1',
      title: 'CS Innovation Scholarship',
      description: 'Supporting the next generation of computer scientists pursuing degrees at accredited U.S. universities. This scholarship rewards academic excellence and a passion for technology.',
      targetAmount: 5000,
      raisedAmount: 2150,
      fieldOfStudy: 'Computer Science',
      creatorId: donor1.id,
      status: 'OPEN',
    },
  });

  const scholarship2 = await prisma.scholarship.upsert({
    where: { id: 'scholarship-2' },
    update: {},
    create: {
      id: 'scholarship-2',
      title: 'Michigan Engineering Fund',
      description: 'A community-backed scholarship for engineering students at the University of Michigan. Every dollar helps a deserving student achieve their dreams.',
      targetAmount: 3000,
      raisedAmount: 3000,
      school: 'University of Michigan',
      fieldOfStudy: 'Engineering',
      creatorId: donor2.id,
      status: 'VOTING',
    },
  });

  const donations = [
    { id: 'don-1', amount: 1, donorId: donor1.id, scholarshipId: scholarship1.id, message: 'Good luck!' },
    { id: 'don-2', amount: 50, donorId: donor2.id, scholarshipId: scholarship1.id, message: null },
    { id: 'don-3', amount: 100, donorId: donor1.id, scholarshipId: scholarship1.id, message: 'Go Blue!' },
    { id: 'don-4', amount: 2000, donorId: donor2.id, scholarshipId: scholarship2.id, message: null },
    { id: 'don-5', amount: 1000, donorId: donor1.id, scholarshipId: scholarship2.id, message: null },
  ];

  for (const d of donations) {
    await prisma.donation.upsert({
      where: { id: d.id },
      update: {},
      create: d,
    });
  }

  await prisma.application.upsert({
    where: { studentId_scholarshipId: { studentId: student1.id, scholarshipId: scholarship2.id } },
    update: {},
    create: {
      studentId: student1.id,
      scholarshipId: scholarship2.id,
      essay: 'As a first-generation college student pursuing engineering at the University of Michigan, every scholarship matters. I have maintained a 3.8 GPA while working part-time to support my education. This scholarship would allow me to focus fully on my studies and research.',
      gpa: 3.8,
      major: 'Mechanical Engineering',
      school: 'University of Michigan',
      status: 'PENDING',
    },
  });

  console.log('Seed complete. Demo accounts:');
  console.log('  Admin:   admin@giveabuck.org / admin123');
  console.log('  Donor:   jane@example.com / donor123');
  console.log('  Student: alex@example.com / student123');
  void admin;
}

main().catch(console.error).finally(() => prisma.$disconnect());

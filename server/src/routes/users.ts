import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';

export const usersRouter = Router();

usersRouter.get('/stats', async (_req, res) => {
  const [totalDonors, totalStudents, totalRaised, totalScholarships] = await Promise.all([
    prisma.user.count({ where: { role: 'DONOR' } }),
    prisma.user.count({ where: { role: 'STUDENT' } }),
    prisma.donation.aggregate({ _sum: { amount: true } }),
    prisma.scholarship.count(),
  ]);
  res.json({
    totalDonors,
    totalStudents,
    totalRaised: totalRaised._sum.amount ?? 0,
    totalScholarships,
  });
});

usersRouter.patch('/me', requireAuth, async (req: AuthRequest, res) => {
  const { name, bio, school, major, avatarUrl } = req.body;
  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: { name, bio, school, major, avatarUrl },
    select: { id: true, email: true, name: true, role: true, school: true, major: true, bio: true, avatarUrl: true },
  });
  res.json(user);
});

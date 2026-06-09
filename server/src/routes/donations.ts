import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';

export const donationsRouter = Router();

const donateSchema = z.object({
  amount: z.number().min(1).max(10000),
  scholarshipId: z.string(),
  anonymous: z.boolean().default(false),
  message: z.string().max(500).optional(),
});

donationsRouter.post('/', requireAuth, async (req: AuthRequest, res) => {
  const result = donateSchema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ error: result.error.flatten() });

  const { amount, scholarshipId, anonymous, message } = result.data;

  const scholarship = await prisma.scholarship.findUnique({ where: { id: scholarshipId } });
  if (!scholarship) return res.status(404).json({ error: 'Scholarship not found' });
  if (scholarship.status !== 'OPEN') return res.status(400).json({ error: 'Scholarship is not accepting donations' });

  const [donation] = await prisma.$transaction([
    prisma.donation.create({
      data: { amount, donorId: req.user!.id, scholarshipId, anonymous, message },
      include: { donor: { select: { id: true, name: true, avatarUrl: true } } },
    }),
    prisma.scholarship.update({
      where: { id: scholarshipId },
      data: { raisedAmount: { increment: amount } },
    }),
  ]);

  res.status(201).json(donation);
});

donationsRouter.get('/my', requireAuth, async (req: AuthRequest, res) => {
  const donations = await prisma.donation.findMany({
    where: { donorId: req.user!.id },
    include: { scholarship: { select: { id: true, title: true, school: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(donations);
});

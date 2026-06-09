import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';

export const scholarshipsRouter = Router();

const createSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(20),
  targetAmount: z.number().positive(),
  school: z.string().optional(),
  fieldOfStudy: z.string().optional(),
  deadline: z.string().datetime().optional(),
});

scholarshipsRouter.get('/', async (req, res) => {
  const { school, field, status, search } = req.query;
  const scholarships = await prisma.scholarship.findMany({
    where: {
      ...(status && { status: status as any }),
      ...(school && { school: { contains: school as string } }),
      ...(field && { fieldOfStudy: { contains: field as string } }),
      ...(search && {
        OR: [
          { title: { contains: search as string } },
          { description: { contains: search as string } },
        ],
      }),
    },
    include: {
      creator: { select: { id: true, name: true, avatarUrl: true } },
      _count: { select: { donations: true, applications: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(scholarships);
});

scholarshipsRouter.get('/leaderboard', async (_req, res) => {
  const bySchool = await prisma.scholarship.groupBy({
    by: ['school'],
    _sum: { raisedAmount: true },
    _count: { id: true },
    where: { school: { not: null } },
    orderBy: { _sum: { raisedAmount: 'desc' } },
    take: 10,
  });
  const byField = await prisma.scholarship.groupBy({
    by: ['fieldOfStudy'],
    _sum: { raisedAmount: true },
    _count: { id: true },
    where: { fieldOfStudy: { not: null } },
    orderBy: { _sum: { raisedAmount: 'desc' } },
    take: 10,
  });
  res.json({ bySchool, byField });
});

scholarshipsRouter.get('/:id', async (req, res) => {
  const scholarship = await prisma.scholarship.findUnique({
    where: { id: req.params.id },
    include: {
      creator: { select: { id: true, name: true, avatarUrl: true } },
      donations: {
        include: { donor: { select: { id: true, name: true, avatarUrl: true } } },
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
      applications: {
        include: {
          student: { select: { id: true, name: true, avatarUrl: true } },
          _count: { select: { votes: true } },
        },
      },
      comments: {
        include: { user: { select: { id: true, name: true, avatarUrl: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  });
  if (!scholarship) return res.status(404).json({ error: 'Not found' });
  res.json(scholarship);
});

scholarshipsRouter.post('/', requireAuth, async (req: AuthRequest, res) => {
  const result = createSchema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ error: result.error.flatten() });

  const scholarship = await prisma.scholarship.create({
    data: { ...result.data, creatorId: req.user!.id, deadline: result.data.deadline ? new Date(result.data.deadline) : undefined },
    include: { creator: { select: { id: true, name: true } } },
  });
  res.status(201).json(scholarship);
});

scholarshipsRouter.patch('/:id/status', requireAuth, requireRole('ADMIN'), async (req: AuthRequest, res) => {
  const { status } = req.body;
  const scholarship = await prisma.scholarship.update({
    where: { id: req.params.id },
    data: { status },
  });
  res.json(scholarship);
});

scholarshipsRouter.post('/:id/comments', requireAuth, async (req: AuthRequest, res) => {
  const { text } = req.body;
  if (!text?.trim()) return res.status(400).json({ error: 'Comment text required' });
  const comment = await prisma.comment.create({
    data: { text, userId: req.user!.id, scholarshipId: req.params.id },
    include: { user: { select: { id: true, name: true, avatarUrl: true } } },
  });
  res.status(201).json(comment);
});

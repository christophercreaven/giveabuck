import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';

export const applicationsRouter = Router();

const applySchema = z.object({
  scholarshipId: z.string(),
  essay: z.string().min(100),
  gpa: z.number().min(0).max(4).optional(),
  major: z.string(),
  school: z.string(),
});

applicationsRouter.post('/', requireAuth, requireRole('STUDENT'), async (req: AuthRequest, res) => {
  const result = applySchema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ error: result.error.flatten() });

  const { scholarshipId, essay, gpa, major, school } = result.data;

  const scholarship = await prisma.scholarship.findUnique({ where: { id: scholarshipId } });
  if (!scholarship) return res.status(404).json({ error: 'Scholarship not found' });
  if (!['OPEN', 'VOTING'].includes(scholarship.status)) {
    return res.status(400).json({ error: 'Scholarship is not accepting applications' });
  }

  const application = await prisma.application.create({
    data: { studentId: req.user!.id, scholarshipId, essay, gpa, major, school },
    include: { student: { select: { id: true, name: true, avatarUrl: true } } },
  });
  res.status(201).json(application);
});

applicationsRouter.post('/:id/vote', requireAuth, requireRole('DONOR'), async (req: AuthRequest, res) => {
  const application = await prisma.application.findUnique({
    where: { id: req.params.id },
    include: { scholarship: true },
  });
  if (!application) return res.status(404).json({ error: 'Application not found' });
  if (application.scholarship.status !== 'VOTING') {
    return res.status(400).json({ error: 'Voting is not open for this scholarship' });
  }

  const existing = await prisma.vote.findUnique({
    where: { voterId_applicationId: { voterId: req.user!.id, applicationId: req.params.id } },
  });

  if (existing) {
    await prisma.vote.delete({ where: { id: existing.id } });
    return res.json({ voted: false });
  }

  await prisma.vote.create({ data: { voterId: req.user!.id, applicationId: req.params.id } });
  res.json({ voted: true });
});

applicationsRouter.patch('/:id/status', requireAuth, requireRole('ADMIN'), async (req: AuthRequest, res) => {
  const { status } = req.body;
  const application = await prisma.application.update({
    where: { id: req.params.id },
    data: { status },
  });
  res.json(application);
});

applicationsRouter.get('/my', requireAuth, async (req: AuthRequest, res) => {
  const applications = await prisma.application.findMany({
    where: { studentId: req.user!.id },
    include: {
      scholarship: { select: { id: true, title: true, status: true } },
      _count: { select: { votes: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(applications);
});

'use server';

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function getState() {
  const users = await prisma.user.findMany();
  const projects = await prisma.project.findMany();
  const tasks = await prisma.task.findMany();
  const auditLog = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 500,
  });
  
  return { users, projects, tasks, auditLog };
}

export async function logActionServer(timestamp: string, user: string, action: string, details: string) {
  await prisma.auditLog.create({
    data: { timestamp, user, action, details }
  });
}

export async function upsertProject(project: any) {
  await prisma.project.upsert({
    where: { id: project.id },
    update: { name: project.name, type: project.type, status: project.status },
    create: { id: project.id, name: project.name, type: project.type, status: project.status },
  });
}

export async function removeProject(id: string) {
  await prisma.task.deleteMany({ where: { projectId: id } });
  await prisma.project.delete({ where: { id } });
}

export async function upsertTask(task: any) {
  await prisma.task.upsert({
    where: { id: task.id },
    update: {
      name: task.name, startDate: task.startDate, endDate: task.endDate,
      assignee: task.assignee, dependsOn: task.dependsOn, status: task.status,
      comment: task.comment, completedAt: task.completedAt
    },
    create: {
      id: task.id, projectId: task.projectId, name: task.name,
      startDate: task.startDate, endDate: task.endDate, assignee: task.assignee,
      dependsOn: task.dependsOn, status: task.status, comment: task.comment,
      completedAt: task.completedAt
    },
  });
}

export async function removeTask(id: string) {
  await prisma.task.delete({ where: { id } });
}

export async function updateTaskFieldServer(id: string, field: string, val: string) {
  await prisma.task.update({
    where: { id },
    data: { [field]: val }
  });
}

export async function checkInTaskServer(id: string, status: string, comment: string, completedAt: string | null) {
  await prisma.task.update({
    where: { id },
    data: { status, comment, completedAt }
  });
}

export async function upsertUser(user: any, originalName: string) {
  if (originalName && originalName !== user.name) {
    // We are renaming a user. Prisma requires deleting and recreating if name is PK, but name is @unique, id is PK.
    // Wait, we don't have IDs in the frontend form, we rely on name.
    const existing = await prisma.user.findUnique({ where: { name: originalName } });
    if (existing) {
      await prisma.user.update({
        where: { id: existing.id },
        data: { name: user.name, email: user.email, mobile: user.mobile, role: user.role, password: user.password }
      });
      // also update tasks assignee
      await prisma.task.updateMany({
        where: { assignee: originalName },
        data: { assignee: user.name }
      });
      return;
    }
  }
  
  await prisma.user.upsert({
    where: { name: user.name },
    update: { email: user.email, mobile: user.mobile, role: user.role, password: user.password },
    create: { name: user.name, email: user.email, mobile: user.mobile, role: user.role, password: user.password },
  });
}

export async function removeUser(name: string) {
  await prisma.user.delete({ where: { name } });
  await prisma.task.updateMany({
    where: { assignee: name },
    data: { assignee: null }
  });
}

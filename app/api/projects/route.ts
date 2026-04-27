import { NextResponse } from 'next/server';
// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();

// Scaffolded endpoint
export async function GET() {
  // const projects = await prisma.project.findMany({ include: { manager: true } });
  
  // Dummy response
  return NextResponse.json({
    status: 'success',
    data: [
      { id: '1', name: 'Alpha Reactor Setup', deviation: 0.15 }
    ]
  });
}

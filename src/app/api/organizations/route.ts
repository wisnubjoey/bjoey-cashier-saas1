import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { organizations } from '@/lib/db/schema';
import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';

// GET - Fetch all organizations for the current user
export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Fetch organizations
    const orgList = await db.query.organizations.findMany({
      where: eq(organizations.userId, userId),
      orderBy: (organizations, { desc }) => [desc(organizations.createdAt)]
    });
    
    return NextResponse.json(orgList);
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organizations' }, 
      { status: 500 }
    );
  }
}

// POST - Create a new organization
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { name, adminPassword } = body;
    
    if (!name || !adminPassword) {
      return NextResponse.json(
        { error: 'Name and admin password are required' }, 
        { status: 400 }
      );
    }
    
    // Generate slug from name
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    
    // Check if organization with this slug already exists
    const existingOrg = await db.query.organizations.findFirst({
      where: eq(organizations.slug, slug)
    });
    
    if (existingOrg) {
      return NextResponse.json(
        { error: 'An organization with this name already exists' }, 
        { status: 409 }
      );
    }
    
    // Create new organization
    const newOrg = await db.insert(organizations).values({
      name,
      slug,
      adminPassword,
      userId,
    }).returning();
    
    return NextResponse.json(newOrg[0], { status: 201 });
  } catch (error) {
    console.error('Error creating organization:', error);
    return NextResponse.json(
      { error: 'Failed to create organization' }, 
      { status: 500 }
    );
  }
}
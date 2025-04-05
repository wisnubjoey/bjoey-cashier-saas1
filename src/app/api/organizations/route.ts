import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { organizations } from '@/lib/db/schema';
import { auth } from '@clerk/nextjs/server';
import { eq, and } from 'drizzle-orm';
import { canUseFeature } from "@/lib/subscription";

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
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Count existing organizations to check subscription limits
    const orgCount = await db.query.organizations.findMany({
      where: eq(organizations.userId, userId),
    });
    
    const currentCount = orgCount.length;
    
    // Check if user can create more organizations based on their subscription
    const canCreate = await canUseFeature(userId, 'organizations', currentCount);
    
    if (!canCreate) {
      return NextResponse.json({
        error: 'You have reached the organization limit for your plan. Please upgrade to create more organizations.'
      }, { status: 403 });
    }
    
    const { name, adminPassword } = await req.json();
    
    // Validasi input
    if (!name || !adminPassword) {
      return NextResponse.json(
        { error: 'Name and admin password are required' },
        { status: 400 }
      );
    }
    
    // Periksa apakah organisasi dengan nama yang sama sudah ada untuk pengguna ini
    const existingOrg = await db.query.organizations.findFirst({
      where: and(
        eq(organizations.name, name),
        eq(organizations.userId, userId)
      ),
    });
    
    if (existingOrg) {
      return NextResponse.json(
        { error: 'An organization with this name already exists for your account' },
        { status: 400 }
      );
    }
    
    // Buat slug yang unik dengan menambahkan userId
    const baseSlug = name.toLowerCase().replace(/\s+/g, '-');
    const uniqueSlug = `${baseSlug}-${userId.substring(0, 8)}`;
    
    // Buat organisasi baru
    const [newOrg] = await db
      .insert(organizations)
      .values({
        name,
        slug: uniqueSlug,
        adminPassword,
        userId,
      })
      .returning();
    
    return NextResponse.json(newOrg);
  } catch (error) {
    console.error('Error creating organization:', error);
    return NextResponse.json(
      { error: 'Failed to create organization' },
      { status: 500 }
    );
  }
}
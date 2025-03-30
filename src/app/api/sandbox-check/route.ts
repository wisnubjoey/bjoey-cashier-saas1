import { NextResponse } from 'next/server';
import { isSandboxMode } from '@/lib/xendit';

export async function GET() {
  return NextResponse.json({
    isSandbox: isSandboxMode()
  });
} 
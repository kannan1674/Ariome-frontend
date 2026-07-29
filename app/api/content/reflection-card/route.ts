import { proxyContentPost } from '@/lib/content/proxy';
import type { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  return proxyContentPost(req, 'reflection-card');
}

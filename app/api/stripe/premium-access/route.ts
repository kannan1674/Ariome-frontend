import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const COOKIE = 'explore_full_access'

/** Returns whether this browser has completed Explore checkout (httpOnly cookie). */
export async function GET() {
  const jar = await cookies()
  const fullAccess = jar.get(COOKIE)?.value === '1'
  return NextResponse.json({ fullAccess })
}

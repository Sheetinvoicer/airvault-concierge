// src/app/api/users/logout/route.ts
import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'))
  response.cookies.delete('payload-token')
  return response
}


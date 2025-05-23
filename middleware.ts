import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Check if Supabase environment variables are defined
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('Supabase environment variables are not defined');
    return NextResponse.next();
  }
  
  try {
    // Create middleware client
    const response = NextResponse.next();
    const supabase = createMiddlewareClient({ req: request, res: response });
    
    // This refreshes the user's session (no redirects needed)
    await supabase.auth.getSession();
    
    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}

// Only exclude static files and assets
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
} 
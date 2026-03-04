import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getOrCreateUser } from '@/lib/db';
import { createMagicToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const { email } = await request.json();
    
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    
    // Generate signed magic link token (JWT, no DB needed)
    const token = await createMagicToken(email);
    
    // Ensure user exists
    await getOrCreateUser(email);
    
    // Generate magic link URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const magicLink = `${appUrl}/auth/verify?token=${token}`;
    
    // Send email
    await resend.emails.send({
      from: 'Website Portal <onboarding@resend.dev>',
      to: email,
      subject: 'Your login link for Website Portal',
      html: `
        <h2>Login to Website Portal</h2>
        <p>Click the link below to log in to your account:</p>
        <p><a href="${magicLink}" style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Log in to Website Portal</a></p>
        <p>This link will expire in 15 minutes.</p>
        <p>If you didn't request this email, you can safely ignore it.</p>
      `,
    });
    
    return NextResponse.json({ 
      message: 'Magic link sent! Check your email.' 
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Failed to send magic link' },
      { status: 500 }
    );
  }
}

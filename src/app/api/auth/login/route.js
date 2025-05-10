import axios from 'axios';
import { NextResponse } from 'next/server';

export async function POST(req) {
  const body = await req.json();
  try {
    const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, body);
    // console.log('Login response:', res.data);
    return NextResponse.json(res.data);
  } catch (error) {
    return NextResponse.json({ message: error.response?.data?.message || 'Login failed' }, { status: 500 });
  }
}
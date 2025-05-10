import axios from 'axios';
import { NextResponse } from 'next/server';

export async function POST(req) {
  const token = req.headers.get('Authorization');
  try {
    const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {}, { headers: { Authorization: token } });
    return NextResponse.json(res.data);
  } catch (error) {
    return NextResponse.json({ message: error.response?.data?.message || 'Logout failed' }, { status: 500 });
  }
}
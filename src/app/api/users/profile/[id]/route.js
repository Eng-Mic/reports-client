import axios from 'axios';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  const token = req.headers.get('Authorization');
  try {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/users/profile/${params.id}`, { headers: { Authorization: token } });
    return NextResponse.json(res.data);
  } catch (error) {
    return NextResponse.json({ message: error.response?.data?.message || 'Fetch profile failed' }, { status: 500 });
  }
}
import axios from 'axios';
import { NextResponse } from 'next/server';

export async function PUT(req, { params }) {
  const token = req.headers.get('Authorization');
  const body = await req.json();
  try {
    const res = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/users/update/${params.id}`, body, { headers: { Authorization: token } });
    return NextResponse.json(res.data);
  } catch (error) {
    return NextResponse.json({ message: error.response?.data?.message || 'Update failed' }, { status: 500 });
  }
}
import axios from 'axios';
import { NextResponse } from 'next/server';

export async function DELETE(req, { params }) {
  const token = req.headers.get('Authorization');
  try {
    const res = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/users/delete/${params.id}`, { headers: { Authorization: token } });
    return NextResponse.json(res.data);
  } catch (error) {
    return NextResponse.json({ message: error.response?.data?.message || 'Delete failed' }, { status: 500 });
  }
}
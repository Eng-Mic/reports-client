import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    console.log("Received parameters:", Object.fromEntries(searchParams.entries()));
    
    // Forward the request to your backend server with the correct path
    const backendURL = `${process.env.NEXT_PUBLIC_API_URL}/api/records/eng/?${searchParams.toString()}`;
    console.log("Forwarding request to:", backendURL);
    
    const response = await fetch(backendURL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    if (!response.ok) {
      throw new Error(`Backend error ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    // console.log("Response data:", data);
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Proxy request failed:", error);
    return NextResponse.json(
      { message: "Error fetching records", error: error.message },
      { status: 500 }
    );
  }
}

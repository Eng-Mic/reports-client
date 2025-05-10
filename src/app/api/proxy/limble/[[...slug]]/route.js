import { NextResponse } from "next/server";

// Adjust base URL as needed
const BACKEND_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/limble`;

export async function GET(request) {
  try {
    const { searchParams, pathname } = new URL(request.url);

    console.log("Received parameters:", Object.fromEntries(searchParams.entries()));
    console.log("Received pathname:", pathname);
    

    // Determine which route is being hit
    let path = pathname.split("/api/proxy/limble")[1] || "";
    if (path.startsWith("/")) path = path.slice(1); // remove leading slash

    // Rebuild backend URL
    const backendURL = `${BACKEND_BASE_URL}/${path}?${searchParams.toString()}`;

    const response = await fetch(backendURL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Backend error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });

  } catch (error) {
    console.error("Proxy request failed:", error);
    return NextResponse.json(
      { message: "Error fetching data from backend", error: error.message },
      { status: 500 }
    );
  }
}

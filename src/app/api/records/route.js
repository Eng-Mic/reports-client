
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
      const backendURL = `http://localhost:5001/api/records`;
      // const backendURL = `http://localhost:5001/api/data/eng`; // Test endpoint
      // console.log("Fetching data for the last 3 months from:", backendURL);
  
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
      // console.log(data);
      
      return NextResponse.json(data, { status: response.status });
  
    } catch (error) {
      console.error("Proxy request failed:", error);
      return NextResponse.json(
        { message: "Error fetching eng records", error: error.message },
        { status: 500 }
      );
    }
  }
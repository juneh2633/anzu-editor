import { getApiBaseUrl } from "@/config/api";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const baseUrl = getApiBaseUrl();
    const formData = await request.formData();

    const response = await fetch(`${baseUrl}/admin/jacket`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Jacket upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload jacket" },
      { status: 500 }
    );
  }
}

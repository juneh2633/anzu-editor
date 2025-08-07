import { getApiBaseUrl } from "@/config/api";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const baseUrl = getApiBaseUrl();
    
    // 요청 헤더에서 Authorization 토큰을 가져옴
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const token = authHeader.substring(7); // 'Bearer ' 제거
    const formData = await request.formData();

    // 디버깅을 위해 전송되는 데이터 로깅
    console.log('Jacket upload - FormData contents:');
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
      } else {
        console.log(`${key}: ${value}`);
      }
    }

    const response = await fetch(`${baseUrl}/admin/jacket`, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    console.log('Jacket upload - Request URL:', `${baseUrl}/admin/jacket`);
    console.log('Jacket upload - Request headers:', {
      'Authorization': `Bearer ${token.substring(0, 10)}...`,
      'Content-Type': 'multipart/form-data (auto-generated)'
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Backend error response:', errorData);
      throw new Error(`Backend error: ${response.status}, response: ${errorData}`);
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

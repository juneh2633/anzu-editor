import { getApiBaseUrl } from '@/config/api';
import { NextRequest, NextResponse } from 'next/server';


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 요청 헤더에서 Authorization 토큰을 가져옴
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const token = authHeader.substring(7); // 'Bearer ' 제거
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/admin/chart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Backend error response:', errorData);
      throw new Error(`Backend error: ${response.status}, response: ${errorData}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Chart add error:', error);
    return NextResponse.json(
      { error: 'Failed to add chart' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 요청 헤더에서 Authorization 토큰을 가져옴
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const token = authHeader.substring(7); // 'Bearer ' 제거
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/admin/chart`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Backend error response:', errorData);
      throw new Error(`Backend error: ${response.status}, response: ${errorData}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Chart update error:', error);
    return NextResponse.json(
      { error: 'Failed to update chart' },
      { status: 500 }
    );
  }
}

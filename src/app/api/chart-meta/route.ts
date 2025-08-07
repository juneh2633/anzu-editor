import { NextResponse } from 'next/server';
import { getApiBaseUrl } from '@/config/api';

export async function GET(request: Request) {
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

    const response = await fetch(`${baseUrl}/chart/meta`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Chart meta API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chart metadata' },
      { status: 500 }
    );
  }
}
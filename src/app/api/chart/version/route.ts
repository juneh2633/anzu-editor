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

    const response = await fetch(`${baseUrl}/chart/version`, {
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
    console.error('Chart version GET API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chart version' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
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

    // 먼저 쿼리 파라미터에서 버전 정보를 확인
    const { searchParams } = new URL(request.url);
    let version = searchParams.get('version');

    // 쿼리 파라미터에 없으면 요청 본문에서 확인
    if (!version) {
      try {
        const body = await request.json();
        version = body.version;
      } catch (e) {
        // JSON 파싱 실패 시 무시
      }
    }

    if (!version || typeof version !== 'string') {
      return NextResponse.json(
        { error: 'Version is required and must be a string' },
        { status: 400 }
      );
    }

    // 백엔드에 쿼리 파라미터로 전송
    const response = await fetch(`${baseUrl}/chart/version?version=${encodeURIComponent(version)}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Backend error response:', errorData);
      throw new Error(`HTTP error! status: ${response.status}, response: ${errorData}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Chart version PUT API error:', error);
    return NextResponse.json(
      { error: 'Failed to update chart version' },
      { status: 500 }
    );
  }
}

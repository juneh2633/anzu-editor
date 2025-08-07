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

    const response = await fetch(`${baseUrl}/playdata/tier`, {
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
    console.error('Tier data API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tier data' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const baseUrl = getApiBaseUrl();

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const body = await request.json();

    // Ensure partInfo metadata is included when sending to backend
    const payload = body.partInfo
      ? body
      : {
          partInfo: {
            partIdx: body.partIdx,
            partName: body.partName,
            description: body.description,
          },
          tierList: body.tierList,
        };

    const response = await fetch(`${baseUrl}/playdata/tier`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Tier data update error:', errorText);
      return NextResponse.json(
        { error: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Tier data API error:', error);
    return NextResponse.json(
      { error: 'Failed to update tier data' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { getBackendBase } from '@/lib/auth/backendAuthProxy';

function getToken(req: NextRequest) {
  return (
    req.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim() ||
    req.cookies.get('authToken')?.value
  );
}

async function proxyDelete(req: NextRequest, id: string) {
  const token = getToken(req);
  if (!token) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const backendBase = getBackendBase();
  if (!backendBase) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  const upstream = await fetch(`${backendBase}/api/videos/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  const text = await upstream.text();
  let raw: unknown;
  try {
    raw = text ? JSON.parse(text) : {};
  } catch {
    return NextResponse.json({ error: 'Invalid response from video service' }, { status: 502 });
  }

  if (!upstream.ok) {
    const err = raw as { message?: string; error?: string };
    return NextResponse.json(
      { error: err.message || err.error || 'Request failed' },
      { status: upstream.status },
    );
  }

  return NextResponse.json(raw, { status: upstream.status });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const token = getToken(req);
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const backendBase = getBackendBase();
    if (!backendBase) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const upstream = await fetch(`${backendBase}/api/videos/${id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const text = await upstream.text();
      let raw: unknown;
      try {
        raw = text ? JSON.parse(text) : {};
      } catch {
        return NextResponse.json({ error: 'Invalid response from video service' }, { status: 502 });
      }

      if (!upstream.ok) {
        const err = raw as { message?: string; error?: string };
        return NextResponse.json(
          { error: err.message || err.error || 'Update failed' },
          { status: upstream.status },
        );
      }

      return NextResponse.json(raw, { status: upstream.status });
    }

    const body = await req.json();
    const upstream = await fetch(`${backendBase}/api/videos/${id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const text = await upstream.text();
    let raw: unknown;
    try {
      raw = text ? JSON.parse(text) : {};
    } catch {
      return NextResponse.json({ error: 'Invalid response from video service' }, { status: 502 });
    }

    if (!upstream.ok) {
      const err = raw as { message?: string; error?: string };
      return NextResponse.json(
        { error: err.message || err.error || 'Update failed' },
        { status: upstream.status },
      );
    }

    return NextResponse.json(raw, { status: upstream.status });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    return proxyDelete(req, id);
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

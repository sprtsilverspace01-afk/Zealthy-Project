import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const res = await fetch('https://gist.githubusercontent.com/sbraford/73f63d75bb995b6597754c1707e40cc2/raw/data.json')
    const data = await res.json()
    return NextResponse.json(data.medications)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch medications' }, { status: 500 })
  }
}

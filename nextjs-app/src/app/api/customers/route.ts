import { NextResponse } from 'next/server'
import { getPrisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const customers = await getPrisma().customer.findMany({
      orderBy: { id: 'asc' },
    })

    return NextResponse.json(customers)
  } catch {
    // Do not expose database errors, which may contain connection details.
    return NextResponse.json(
      { error: '顧客一覧を取得できませんでした。' },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON形式の入力が必要です。' }, { status: 400 })
  }

  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return NextResponse.json({ error: '入力形式が不正です。' }, { status: 400 })
  }

  const input = body as Record<string, unknown>
  const limits = { name: 200, email: 254, phone: 50, industry: 200 }
  // PostgreSQLのTEXTにはモデル上の文字数制限がないため、APIの入力上限を設ける。
  const data = { type: '', name: '', email: '', phone: '', industry: '' }
  if (input.type !== '法人' && input.type !== '個人') {
    return NextResponse.json({ error: '顧客区分は法人または個人を指定してください。' }, { status: 400 })
  }
  data.type = input.type

  for (const field of ['name', 'email', 'phone', 'industry'] as const) {
    const value = input[field]
    if (value === undefined && field !== 'name') continue
    if (typeof value !== 'string' || value.includes('\u0000') || value.length > limits[field]) {
      return NextResponse.json(
        { error: `${field}は${limits[field]}文字以内の文字列で入力してください。` },
        { status: 400 },
      )
    }
    data[field] = value.trim()
  }

  if (!data.name) {
    return NextResponse.json({ error: '会社名・氏名は必須です。' }, { status: 400 })
  }
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return NextResponse.json({ error: 'メールアドレスの形式を確認してください。' }, { status: 400 })
  }
  if (data.type === '個人') data.industry = ''

  try {
    const customer = await getPrisma().customer.create({ data })
    return NextResponse.json(customer, { status: 201 })
  } catch {
    return NextResponse.json({ error: '顧客を登録できませんでした。' }, { status: 500 })
  }
}

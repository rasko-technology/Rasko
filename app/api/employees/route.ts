import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/app/lib/supabase/server'
import { requireStore } from '@/app/lib/auth'
import bcrypt from 'bcryptjs'
import { EmployeeFormSchema } from '@/app/lib/definitions'

export async function GET() {
  const membership = await requireStore()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('employees')
    .select('id, name, username, phone, email, is_active, created_at')
    .eq('store_id', membership.store_id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const membership = await requireStore()

  const body = await request.json()
  const validated = EmployeeFormSchema.safeParse(body)

  if (!validated.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: validated.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  // Hash the password
  const passwordHash = await bcrypt.hash(validated.data.password, 10)

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('employees')
    .insert({
      store_id: membership.store_id,
      name: validated.data.name,
      username: validated.data.username,
      password_hash: passwordHash,
      phone: validated.data.phone || null,
      email: validated.data.email || null,
    })
    .select('id, name, username')
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Username already exists in this store.' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}

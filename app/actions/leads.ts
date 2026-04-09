'use server'

import { createClient } from '@/app/lib/supabase/server'
import { requireStore } from '@/app/lib/auth'
import { revalidatePath } from 'next/cache'
import type { FormState } from '@/app/lib/definitions'

export async function createLead(state: FormState, formData: FormData): Promise<FormState> {
  const membership = await requireStore()

  const customer_name = formData.get('customer_name')?.toString()?.trim()
  const phone = formData.get('phone')?.toString()?.trim()

  if (!customer_name || !phone) {
    return { message: 'Customer name and phone are required.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.from('leads').insert({
    store_id: membership.store_id,
    customer_name,
    phone,
    email: formData.get('email')?.toString()?.trim() || null,
    address: formData.get('address')?.toString()?.trim() || null,
    item: formData.get('item')?.toString()?.trim() || null,
    configuration: formData.get('configuration')?.toString()?.trim() || null,
    quantity: parseInt(formData.get('quantity')?.toString() || '1') || 1,
    payment_mode: formData.get('payment_mode')?.toString()?.trim() || null,
    amount: parseFloat(formData.get('amount')?.toString() || '0') || null,
    status: formData.get('status')?.toString() || 'new',
    action_taken: formData.get('action_taken')?.toString()?.trim() || null,
    notes: formData.get('notes')?.toString()?.trim() || null,
    assigned_to: formData.get('assigned_to') ? parseInt(formData.get('assigned_to')!.toString()) : null,
  })

  if (error) {
    console.error('Lead creation error:', error)
    return { message: 'Failed to create lead.' }
  }

  revalidatePath('/dashboard/leads')
  return { success: true, message: 'Lead created successfully.' }
}

export async function updateLeadStatus(id: number, status: string): Promise<FormState> {
  await requireStore()
  const supabase = await createClient()

  const { error } = await supabase
    .from('leads')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    return { message: 'Failed to update status.' }
  }

  revalidatePath('/dashboard/leads')
  return { success: true }
}

export async function deleteLead(id: number): Promise<FormState> {
  await requireStore()
  const supabase = await createClient()

  const { error } = await supabase.from('leads').delete().eq('id', id)

  if (error) {
    return { message: 'Failed to delete lead.' }
  }

  revalidatePath('/dashboard/leads')
  return { success: true, message: 'Lead deleted.' }
}

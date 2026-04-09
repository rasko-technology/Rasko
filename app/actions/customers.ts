"use server";

import { requireStore, createStoreClient } from "@/app/lib/auth";
import { revalidatePath } from "next/cache";
import type { FormState } from "@/app/lib/definitions";
import { z } from "zod";

const CustomerSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  address: z.string().optional(),
  landmark: z.string().optional(),
  city: z.string().optional(),
  pincode: z.string().optional(),

  gst_number: z.string().optional(),
  notes: z.string().optional(),
  address_lat: z.coerce.number().optional(),
  address_lng: z.coerce.number().optional(),
  full_address: z.string().optional(),
});

export async function createCustomer(
  state: FormState,
  formData: FormData,
): Promise<FormState> {
  const membership = await requireStore();

  const validated = CustomerSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    address: formData.get("address"),
    landmark: formData.get("landmark"),
    city: formData.get("city"),
    pincode: formData.get("pincode"),

    gst_number: formData.get("gst_number"),
    notes: formData.get("notes"),
    address_lat: formData.get("address_lat") || undefined,
    address_lng: formData.get("address_lng") || undefined,
    full_address: formData.get("full_address") || undefined,
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const supabase = await createStoreClient();
  const { data: newCustomer, error } = await supabase
    .from("customers")
    .insert({
      store_id: membership.store_id,
      name: validated.data.name,
      phone: validated.data.phone || null,
      email: validated.data.email || null,
      address: validated.data.address || null,
      landmark: validated.data.landmark || null,
      city: validated.data.city || null,
      pincode: validated.data.pincode || null,

      gst_number: validated.data.gst_number || null,
      notes: validated.data.notes || null,
      address_lat: validated.data.address_lat || null,
      address_lng: validated.data.address_lng || null,
      full_address: validated.data.full_address || null,
    })
    .select("id, name, phone, address")
    .single();

  if (error) {
    return { message: "Failed to create customer." };
  }

  revalidatePath("/dashboard/customers");
  return {
    success: true,
    message: "Customer created successfully.",
    data: newCustomer
      ? {
          id: newCustomer.id,
          name: newCustomer.name,
          phone: newCustomer.phone,
          address: newCustomer.address,
        }
      : undefined,
  };
}

export async function updateCustomer(
  id: number,
  state: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireStore();

  const validated = CustomerSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    address: formData.get("address"),
    landmark: formData.get("landmark"),
    city: formData.get("city"),
    pincode: formData.get("pincode"),

    gst_number: formData.get("gst_number"),
    notes: formData.get("notes"),
    address_lat: formData.get("address_lat") || undefined,
    address_lng: formData.get("address_lng") || undefined,
    full_address: formData.get("full_address") || undefined,
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const supabase = await createStoreClient();
  const { error } = await supabase
    .from("customers")
    .update({
      name: validated.data.name,
      phone: validated.data.phone || null,
      email: validated.data.email || null,
      address: validated.data.address || null,
      landmark: validated.data.landmark || null,
      city: validated.data.city || null,
      pincode: validated.data.pincode || null,

      gst_number: validated.data.gst_number || null,
      notes: validated.data.notes || null,
      address_lat: validated.data.address_lat || null,
      address_lng: validated.data.address_lng || null,
      full_address: validated.data.full_address || null,
    })
    .eq("id", id);

  if (error) {
    return { message: "Failed to update customer." };
  }

  revalidatePath("/dashboard/customers");
  return { success: true, message: "Customer updated." };
}

export async function deleteCustomer(id: number): Promise<FormState> {
  await requireStore();
  const supabase = await createStoreClient();
  const { error } = await supabase.from("customers").delete().eq("id", id);

  if (error) {
    return { message: "Failed to delete customer." };
  }

  revalidatePath("/dashboard/customers");
  return { success: true, message: "Customer deleted." };
}

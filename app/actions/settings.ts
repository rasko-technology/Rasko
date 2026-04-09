"use server";

import { createClient } from "@/app/lib/supabase/server";
import { requireAuth, getUserStore } from "@/app/lib/auth";
import { revalidatePath } from "next/cache";
import type { FormState } from "@/app/lib/definitions";
import { z } from "zod";

const StoreUpdateSchema = z.object({
  name: z.string().min(2, "Store name is required").trim(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  website: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  pincode: z.string().optional(),
  full_address: z.string().optional(),
});

export async function updateStore(
  state: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAuth();
  const membership = await getUserStore();
  if (!membership) return { message: "No store found." };

  const validated = StoreUpdateSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    website: formData.get("website"),
    address: formData.get("address"),
    city: formData.get("city"),
    pincode: formData.get("pincode"),
    full_address: formData.get("full_address"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("stores")
    .update({
      name: validated.data.name,
      phone: validated.data.phone || null,
      email: validated.data.email || null,
      website: validated.data.website || null,
      address: validated.data.address || null,
      city: validated.data.city || null,
      pincode: validated.data.pincode || null,
      full_address: validated.data.full_address || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", membership.store_id);

  if (error) {
    return { message: "Failed to update store." };
  }

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
  return { success: true, message: "Store updated successfully." };
}

const OwnerUpdateSchema = z.object({
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional()
    .or(z.literal("")),
});

export async function updateOwnerProfile(
  state: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAuth();

  const validated = OwnerUpdateSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const supabase = await createClient();

  const updates: Record<string, string> = {};
  if (validated.data.email) updates.email = validated.data.email;
  if (validated.data.password) updates.password = validated.data.password;

  if (Object.keys(updates).length === 0) {
    return { message: "No changes to save." };
  }

  const { error } = await supabase.auth.updateUser(updates);

  if (error) {
    return { message: error.message || "Failed to update profile." };
  }

  revalidatePath("/dashboard/settings");
  return { success: true, message: "Profile updated successfully." };
}

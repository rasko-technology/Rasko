"use server";

import { createClient } from "@/app/lib/supabase/server";
import { requireAuth, getUserStore } from "@/app/lib/auth";
import { revalidatePath } from "next/cache";
import type { FormState } from "@/app/lib/definitions";
import { z } from "zod";

const StoreDetailsSchema = z.object({
  name: z.string().min(2, "Store name is required").trim(),
  tagline: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  website: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  pincode: z.string().optional(),
  full_address: z.string().optional(),
  address_lat: z.string().optional(),
  address_lng: z.string().optional(),
  gstin: z.string().optional(),
  pan: z.string().optional(),
  inspection_charges: z.string().optional(),
  logo_url: z.string().optional(),
});

const BankDetailsSchema = z.object({
  bank_name: z.string().optional(),
  bank_ifsc_code: z.string().optional(),
  bank_branch_name: z.string().optional(),
  bank_account_holder_name: z.string().optional(),
  bank_account_number: z.string().optional(),
  bank_upi_id: z.string().optional(),
});

const GeneralTermsSchema = z.object({
  general_terms: z.string().optional(),
});

export async function updateStore(
  state: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAuth();
  const membership = await getUserStore();
  if (!membership) return { message: "No store found." };

  const section = formData.get("_section")?.toString() || "store";
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let updateData: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (section === "store") {
    const validated = StoreDetailsSchema.safeParse({
      name: formData.get("name"),
      tagline: formData.get("tagline"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      website: formData.get("website"),
      address: formData.get("address"),
      city: formData.get("city"),
      pincode: formData.get("pincode"),
      full_address: formData.get("full_address"),
      address_lat: formData.get("address_lat"),
      address_lng: formData.get("address_lng"),
      gstin: formData.get("gstin"),
      pan: formData.get("pan"),
      inspection_charges: formData.get("inspection_charges"),
      logo_url: formData.get("logo_url"),
    });
    if (!validated.success) {
      return { errors: validated.error.flatten().fieldErrors };
    }
    const d = validated.data;
    const ic = d.inspection_charges ? parseFloat(d.inspection_charges) : null;
    const lat = d.address_lat ? parseFloat(d.address_lat) : null;
    const lng = d.address_lng ? parseFloat(d.address_lng) : null;
    updateData = {
      ...updateData,
      name: d.name,
      tagline: d.tagline || null,
      phone: d.phone || null,
      email: d.email || null,
      website: d.website || null,
      address: d.address || null,
      city: d.city || null,
      pincode: d.pincode || null,
      full_address: d.full_address || null,
      address_lat: lat && !isNaN(lat) ? lat : null,
      address_lng: lng && !isNaN(lng) ? lng : null,
      gstin: d.gstin || null,
      pan: d.pan || null,
      inspection_charges: ic && !isNaN(ic) ? ic : null,
      logo_url: d.logo_url || null,
    };
  } else if (section === "bank") {
    const validated = BankDetailsSchema.safeParse({
      bank_name: formData.get("bank_name"),
      bank_ifsc_code: formData.get("bank_ifsc_code"),
      bank_branch_name: formData.get("bank_branch_name"),
      bank_account_holder_name: formData.get("bank_account_holder_name"),
      bank_account_number: formData.get("bank_account_number"),
      bank_upi_id: formData.get("bank_upi_id"),
    });
    if (!validated.success) {
      return { errors: validated.error.flatten().fieldErrors };
    }
    const d = validated.data;
    updateData = {
      ...updateData,
      bank_name: d.bank_name || null,
      bank_ifsc_code: d.bank_ifsc_code || null,
      bank_branch_name: d.bank_branch_name || null,
      bank_account_holder_name: d.bank_account_holder_name || null,
      bank_account_number: d.bank_account_number || null,
      bank_upi_id: d.bank_upi_id || null,
    };
  } else if (section === "terms") {
    const validated = GeneralTermsSchema.safeParse({
      general_terms: formData.get("general_terms"),
    });
    if (!validated.success) {
      return { errors: validated.error.flatten().fieldErrors };
    }
    updateData = {
      ...updateData,
      general_terms: validated.data.general_terms || null,
    };
  }

  const { error } = await supabase
    .from("stores")
    .update(updateData)
    .eq("id", membership.store_id);

  if (error) {
    console.error("Store update error:", error);
    return { message: "Failed to update store." };
  }

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
  return { success: true, message: "Settings saved successfully." };
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

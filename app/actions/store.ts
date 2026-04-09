"use server";

import { createClient } from "@/app/lib/supabase/server";
import { requireAuth } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { StoreFormSchema, type FormState } from "@/app/lib/definitions";

export async function createStore(
  state: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAuth();

  const validatedFields = StoreFormSchema.safeParse({
    name: formData.get("name"),
    address: formData.get("address"),
    city: formData.get("city"),
    pincode: formData.get("pincode"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    website: formData.get("website"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const supabase = await createClient();

  const addressLat = formData.get("address_lat")?.toString()?.trim();
  const addressLng = formData.get("address_lng")?.toString()?.trim();
  const fullAddress = formData.get("full_address")?.toString()?.trim();

  // Atomic RPC: creates store + store_member + subscription in one call
  // Uses SECURITY DEFINER to bypass RLS (user has no store_member yet)
  const { data: storeId, error } = await supabase.rpc(
    "create_store_with_membership",
    {
      p_name: validatedFields.data.name,
      p_address: validatedFields.data.address || null,
      p_city: validatedFields.data.city || null,
      p_pincode: validatedFields.data.pincode || null,
      p_phone: validatedFields.data.phone || null,
      p_email: validatedFields.data.email || null,
      p_website: validatedFields.data.website || null,
      p_address_lat: addressLat ? parseFloat(addressLat) : null,
      p_address_lng: addressLng ? parseFloat(addressLng) : null,
      p_full_address: fullAddress || null,
    },
  );

  if (error || !storeId) {
    console.error("Store creation failed:", error);
    return { message: "Failed to create store. Please try again." };
  }

  redirect("/dashboard");
}

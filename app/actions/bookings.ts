"use server";

import { createClient } from "@/app/lib/supabase/server";
import { requireStore } from "@/app/lib/auth";
import { revalidatePath } from "next/cache";
import type { FormState } from "@/app/lib/definitions";

export async function createBooking(
  state: FormState,
  formData: FormData,
): Promise<FormState> {
  const membership = await requireStore();
  const supabase = await createClient();

  // Product fields
  const product_name = formData.get("product_name")?.toString()?.trim();
  const brand_name = formData.get("brand_name")?.toString()?.trim();
  const problem = formData.get("problem")?.toString()?.trim();

  if (!product_name || !brand_name || !problem) {
    return { message: "Please fill all required product fields." };
  }

  // Customer handling: existing or new
  const existingCustomerId = formData.get("customer_id")?.toString()?.trim();
  let customerId: number | null = null;

  if (existingCustomerId) {
    // Use existing customer
    customerId = parseInt(existingCustomerId, 10);
  } else {
    // Create new customer
    const name = formData.get("customer_name")?.toString()?.trim();
    const phone = formData.get("phone")?.toString()?.trim();
    if (!name || !phone) {
      return { message: "Customer name and phone are required." };
    }

    const { data: newCustomer, error: custError } = await supabase
      .from("customers")
      .insert({
        store_id: membership.store_id,
        name,
        phone,
        email: formData.get("email")?.toString()?.trim() || null,
        address: formData.get("address")?.toString()?.trim() || null,
        landmark: formData.get("landmark")?.toString()?.trim() || null,
        city: formData.get("city")?.toString()?.trim() || null,
        pincode: formData.get("pincode")?.toString()?.trim() || null,
        gst_number: formData.get("gst_number")?.toString()?.trim() || null,
        notes: formData.get("customer_notes")?.toString()?.trim() || null,
        address_lat: formData.get("address_lat")
          ? parseFloat(formData.get("address_lat") as string)
          : null,
        address_lng: formData.get("address_lng")
          ? parseFloat(formData.get("address_lng") as string)
          : null,
        full_address: formData.get("full_address")?.toString()?.trim() || null,
      })
      .select("id")
      .single();

    if (custError || !newCustomer) {
      console.error("Customer creation error:", custError);
      return { message: "Failed to create customer." };
    }
    customerId = newCustomer.id;
  }

  // Create booking — only customer_id + product fields
  const { error } = await supabase.from("bookings").insert({
    store_id: membership.store_id,
    customer_id: customerId,
    product_name,
    brand_name,
    model_name: formData.get("model_name")?.toString()?.trim() || null,
    problem,
    remark: formData.get("remark")?.toString()?.trim() || null,
  });

  if (error) {
    console.error("Booking creation error:", error);
    return { message: "Failed to create booking." };
  }

  revalidatePath("/dashboard/bookings");
  revalidatePath("/dashboard/customers");
  return { success: true, message: "Booking created successfully." };
}

export async function updateBookingStatus(
  id: number,
  status: string,
): Promise<FormState> {
  await requireStore();
  const supabase = await createClient();

  const { error } = await supabase
    .from("bookings")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return { message: "Failed to update status." };
  }

  revalidatePath("/dashboard/bookings");
  return { success: true };
}

export async function deleteBooking(id: number): Promise<FormState> {
  await requireStore();
  const supabase = await createClient();

  const { error } = await supabase.from("bookings").delete().eq("id", id);

  if (error) {
    return { message: "Failed to delete booking." };
  }

  revalidatePath("/dashboard/bookings");
  return { success: true, message: "Booking deleted." };
}

export async function confirmBooking(id: number): Promise<FormState> {
  const membership = await requireStore();
  const supabase = await createClient();

  // Fetch booking with customer details
  const { data: booking, error: fetchError } = await supabase
    .from("bookings")
    .select("*, customer:customers(id, name, phone, address)")
    .eq("id", id)
    .eq("store_id", membership.store_id)
    .single();

  if (fetchError || !booking) {
    return { message: "Booking not found." };
  }

  if (booking.status === "cancelled") {
    return { message: "Cannot confirm a cancelled booking." };
  }

  // Create job card from booking data
  const { data: newJobcard, error: jcError } = await supabase
    .from("jobcards")
    .insert({
      store_id: membership.store_id,
      booking_id: booking.id,
      customer_id: booking.customer_id,
      customer_name: booking.customer?.name || null,
      phone: booking.customer?.phone || null,
      address: booking.customer?.address || null,
      product_name: booking.product_name || null,
      brand: booking.brand_name || null,
      model_name: booking.model_name || null,
      default_issues: booking.problem ? [booking.problem] : [],
      notes: booking.remark || null,
      booking_date_time: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (jcError) {
    console.error("Job card creation from booking failed:", jcError);
    return { message: "Failed to create job card. " + jcError.message };
  }

  // Update booking status to confirmed
  await supabase
    .from("bookings")
    .update({ status: "confirmed", updated_at: new Date().toISOString() })
    .eq("id", id);

  revalidatePath("/dashboard/bookings");
  revalidatePath("/dashboard/jobcards");
  return {
    success: true,
    message: "Booking confirmed and job card created!",
    data: { jobcardId: newJobcard?.id },
  };
}

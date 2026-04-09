import * as z from "zod";

// ============================================
// AUTH SCHEMAS
// ============================================
export const SignupFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }).trim(),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." })
    .trim(),
});

export const LoginFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }).trim(),
  password: z.string().min(1, { message: "Password is required." }).trim(),
});

export const EmployeeLoginSchema = z.object({
  username: z.string().min(1, { message: "Username is required." }).trim(),
  password: z.string().min(1, { message: "Password is required." }).trim(),
  store_code: z.string().min(1, { message: "Store code is required." }).trim(),
});

// ============================================
// STORE SCHEMAS
// ============================================
export const StoreFormSchema = z.object({
  name: z.string().min(2, { message: "Store name is required." }).trim(),
  address: z.string().optional(),
  city: z.string().optional(),
  pincode: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  website: z.string().optional(),
});

// ============================================
// EMPLOYEE SCHEMAS
// ============================================
export const EmployeeFormSchema = z.object({
  name: z.string().min(2, { message: "Name is required." }).trim(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters." })
    .trim(),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." })
    .trim(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
});

// ============================================
// LEAD SCHEMAS
// ============================================
export const LeadFormSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }).trim(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  source: z.enum(["manual", "website", "whatsapp"]).default("manual"),
  notes: z.string().optional(),
});

// ============================================
// BOOKING SCHEMAS
// ============================================
export const BookingFormSchema = z.object({
  customer_name: z
    .string()
    .min(1, { message: "Customer name is required." })
    .trim(),
  phone: z.string().optional(),
  address: z.string().optional(),
  scheduled_date: z.string().optional(),
  notes: z.string().optional(),
});

// ============================================
// FORM STATE TYPE
// ============================================
export type FormState =
  | {
      errors?: Record<string, string[]>;
      message?: string;
      success?: boolean;
      data?: Record<string, unknown>;
    }
  | undefined;

/* ── Enums / Union types ─────────────────────────────────── */

export type BookingStatus =
  | "pending_payment"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show";

export type PaymentMethod = "mvola" | "airtel_money" | "stripe" | "cash";

export type ServiceCategory =
  | "coiffure"
  | "esthetique"
  | "onglerie"
  | "maquillage";

/* ── Database table interfaces ──────────────────────────── */

export interface Service {
  id: string;
  name: string;
  description: string | null;
  category: ServiceCategory;
  duration_minutes: number;
  price: number;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Staff {
  id: string;
  full_name: string;
  role: string;
  bio: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  client_id: string;
  service_id: string;
  staff_id: string | null;
  date: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  payment_method: PaymentMethod | null;
  payment_reference: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AvailabilitySlot {
  id: string;
  staff_id: string;
  day_of_week: number; // 0 = Sunday … 6 = Saturday
  start_time: string;
  end_time: string;
  is_available: boolean;
  created_at: string;
}

export interface SchoolCourse {
  id: string;
  title: string;
  description: string | null;
  category: ServiceCategory;
  duration_weeks: number;
  price: number;
  max_students: number;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Enrolment {
  id: string;
  student_id: string;
  course_id: string;
  enrolled_at: string;
  status: "active" | "completed" | "withdrawn";
  payment_method: PaymentMethod | null;
  payment_reference: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: "client" | "staff" | "admin";
  created_at: string;
  updated_at: string;
}

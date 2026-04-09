import { BookingForm } from "./BookingForm";

export default function BookingServicePage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
          Request a repair for your product
        </h1>
        <p className="text-surface-500 mt-1">
          Fill in product and customer details to book a service
        </p>
      </div>
      <BookingForm />
    </div>
  );
}

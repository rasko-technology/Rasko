// Service option types and labels.
// Per-product default options are now stored in the database
// (catalog_product_options table) and fetched via server actions.

export type ServiceOptionType =
  | "default_issue"
  | "items_received"
  | "action_taken"
  | "engineer_observation"
  | "additional_requirement"
  | "customer_note";

export const SERVICE_OPTION_LABELS: Record<ServiceOptionType, string> = {
  default_issue: "Default Issues",
  items_received: "Items Received",
  action_taken: "Action Taken",
  engineer_observation: "Engineer Observation",
  additional_requirement: "Additional Requirements",
  customer_note: "Customer Note",
};

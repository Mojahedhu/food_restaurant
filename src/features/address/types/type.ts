export interface AddressRaw {
  _id: string;
  label: string;
  apartment: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  instructions: string;
  type: string;
  isDefault: boolean;
  pending?: boolean; // 👈 for optimistic UI
}

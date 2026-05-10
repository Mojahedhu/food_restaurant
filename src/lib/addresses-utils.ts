import { Address } from "../../types/sanityTypes";

// 🧠 ensure only one default
export function setSingleDefault(addresses: Address[], id: string) {
  return addresses.map((a) => ({
    ...a,
    isDefault: a._id === id,
  }));
}

// 🧠 handle delete default case
export function handleDeleteDefault(addresses: Address[], id: string) {
  const deleted = addresses.find((a) => a._id === id);
  const updated = addresses.filter((a) => a._id !== id);

  if (deleted?.isDefault && updated.length > 0) {
    updated[0].isDefault = true;
  }
  return updated;
}

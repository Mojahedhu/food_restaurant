import { client } from "@/sanity/lib/client";
import { AddressRaw } from "@/features/address/types/type";
import { Address } from "@/../types/sanityTypes";
import { ServiceError } from "./errors";

export async function createAddress(userId: string, data: Omit<Address, "_id">) {
  if (!userId) {
    throw new ServiceError("Unauthorized", "UNAUTHORIZED");
  }

  const transaction = client.transaction();

  // 🧠 Check if user has NO addresses → force default
  const existingCount = await client.fetch(
    `count(*[_type == "address" && user._ref == $userId])`,
    { userId }
  );

  const shouldBeDefault = existingCount === 0 || data.isDefault;

  // 🔥 Unset previous defaults if this new one should be the default
  if (shouldBeDefault) {
    const existingDefaults = await client.fetch(
      `*[_type == "address" && user._ref == $userId && isDefault == true]._id`,
      { userId }
    );

    existingDefaults.forEach((id: string) => {
      transaction.patch(id, {
        set: { isDefault: false },
      });
    });
  }

  // ✅ Create address
  transaction.create({
    _type: "address",
    type: data.type,
    label: data.label,
    street: data.street,
    apartment: data.apartment,
    city: data.city,
    state: data.state,
    zipCode: data.zipCode,
    phone: data.phone,
    instructions: data.instructions,
    isDefault: shouldBeDefault,
    user: {
      _type: "reference",
      _ref: userId,
    },
  });

  const result = await transaction.commit();

  return {
    addressId: result.results[0].id,
  };
}

export async function getAddress(id: string) {
  if (!id) {
    throw new ServiceError("Address ID is required", "BAD_REQUEST");
  }
  
  const address = await client.getDocument(id);
  if (!address) {
    throw new ServiceError("Address not found", "NOT_FOUND");
  }
  
  return address;
}

export async function updateAddress(userId: string, id: string, data: Partial<Address>) {
  if (!userId) {
    throw new ServiceError("Unauthorized", "UNAUTHORIZED");
  }
  if (!id) {
    throw new ServiceError("Address ID is required", "BAD_REQUEST");
  }

  // Security: Verify ownership before modifying
  const existingAddress = await client.getDocument(id);
  if (!existingAddress) {
    throw new ServiceError("Address not found", "NOT_FOUND");
  }
  if (existingAddress.user?._ref !== userId) {
    throw new ServiceError("Forbidden: Cannot modify someone else's address", "FORBIDDEN");
  }

  const updates: Partial<AddressRaw> = {
    type: data.type,
    label: data.label,
    street: data.street,
    apartment: data.apartment,
    city: data.city,
    state: data.state,
    zipCode: data.zipCode,
    phone: data.phone,
    instructions: data.instructions,
    isDefault: data.isDefault,
  };

  const transaction = client.transaction();

  // 🧠 If updating to default → unset others
  if (updates.isDefault === true) {
    transaction.patch(
      {
        query: `*[_type == "address" && user._ref == $userId && _id != $id]`,
        params: { userId, id },
      },
      { set: { isDefault: false } }
    );
  }

  // ✅ Update address
  transaction.patch(id, {
    set: updates,
  });
  
  await transaction.commit();

  return { addressId: id };
}

export async function deleteAddress(userId: string, id: string) {
  if (!userId) {
    throw new ServiceError("Unauthorized", "UNAUTHORIZED");
  }
  if (!id) {
    throw new ServiceError("Address ID is required", "BAD_REQUEST");
  }

  const transaction = client.transaction();

  // 1- Get Address being deleted
  const address = await client.getDocument(id);
  if (!address) {
    throw new ServiceError("Address not found", "NOT_FOUND");
  }

  // Security Verification
  if (address.user?._ref !== userId) {
    throw new ServiceError("Forbidden: Cannot delete someone else's address", "FORBIDDEN");
  }

  // 2- Delete it
  transaction.delete(id);

  // 3- If deleted was default → assign new default to the first available
  if (address.isDefault) {
    transaction.patch(
      {
        query: `*[_type == "address" && user._ref == $userId][0]`,
        params: { userId },
      },
      { set: { isDefault: true } }
    );
  }

  await transaction.commit();

  return { success: true };
}

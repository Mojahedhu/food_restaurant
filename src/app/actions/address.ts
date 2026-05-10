// app/actions/address.ts
"use server";

import { client } from "@/sanity/lib/client";
import auth from "../../../auth";
import { AddressRaw } from "@/features/address/types/type";
import { Address } from "../../../types/sanityTypes";

export async function createAddressAction(formData: Omit<Address, "_id">) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  const data = {
    type: formData.type,
    label: formData.label,
    street: formData.street,
    apartment: formData.apartment,
    city: formData.city,
    state: formData.state,
    zipCode: formData.zipCode,
    phone: formData.phone,
    instructions: formData.instructions,
    isDefault: formData.isDefault === true,
  };

  const transaction = client.transaction();

  // 🧠 Check if user has NO addresses → force default
  const existingCount = await client.fetch(
    `count(*[_type == "address" && user._ref == $userId])`,
    { userId },
  );

  const shouldBeDefault = existingCount === 0 || data.isDefault;

  // 🔥 Unset previous defaults
  if (shouldBeDefault) {
    const existingDefaults = await client.fetch(
      `*[_type == "address" && user._ref == $userId && isDefault == true]._id`,
      { userId },
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
    ...data,
    isDefault: shouldBeDefault,
    user: {
      _type: "reference",
      _ref: userId,
    },
  });

  const result = await transaction.commit();

  return {
    success: true,
    addressId: result.results[0].id,
  };
}

export async function getAddressAction(id: string) {
  const address = await client.getDocument(id);
  return address;
}

export async function updateAddressAction(
  id: string,
  formData: Partial<Address>,
) {
  const session = await auth();

  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;

  const updates: Partial<AddressRaw> = {
    type: formData.type,
    label: formData.label,
    street: formData.street,
    apartment: formData.apartment,
    city: formData.city,
    state: formData.state,
    zipCode: formData.zipCode,
    phone: formData.phone,
    instructions: formData.instructions,
    isDefault: formData.isDefault,
  };

  const transaction = client.transaction();

  // 🧠 If updating to default → unset others
  if (updates.isDefault === true) {
    transaction.patch(
      {
        query: `*[_type == "address" && user._ref == $userId && _id != $id]`,
        params: { userId, id },
      },
      { set: { isDefault: false } },
    );
  }

  // ✅ Update address
  transaction.patch(id, {
    set: updates,
  });
  try {
    await transaction.commit();

    return { success: true, addressId: id };
  } catch (error) {
    console.error(error);
    return { success: false, error };
  }
}
export async function deleteAddressAction(id: string, userId: string) {
  const transaction = client.transaction();

  // 1- Get Address being deleted
  const address = await client.getDocument(id);
  if (!address) throw new Error("Address not found");

  // 2-Delete it
  transaction.delete(id);

  // 3- If deleted was default → assign new default
  if (address.isDefault) {
    transaction.patch(
      {
        query: `*[_type == "address" && user._ref == $userId][0]`,
        params: { userId },
      },
      { set: { isDefault: true } },
    );
  }

  await transaction.commit();

  return { success: true };
}

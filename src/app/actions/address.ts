// app/actions/address.ts
"use server";

import { client } from "@/sanity/lib/client";
import auth from "../../../auth";
import { AddressRaw } from "@/features/address/types/type";

export async function createAddressAction(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  const data = {
    type: formData.get("type"),
    label: formData.get("label"),
    street: formData.get("street"),
    apartment: formData.get("apartment"),
    city: formData.get("city"),
    state: formData.get("state"),
    zipCode: formData.get("zipCode"),
    phone: formData.get("phone"),
    instructions: formData.get("instructions"),
    isDefault: formData.get("isDefault") === "on",
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

export async function updateAddressAction(id: string, formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;

  const updates: Partial<AddressRaw> = {};
  Object.entries(formData).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      updates[key as keyof AddressRaw] = value;
    }
  });

  const transaction = client.transaction();

  // 🧠 If updating to default → unset others
  if (updates.isDefault) {
    const existingDefaults = await client.fetch(
      `*[_type == "address" && user._ref == $userId && isDefault == true]._id`,
      { userId },
    );

    existingDefaults.forEach((defId: string) => {
      if (defId !== id) {
        transaction.patch(defId, {
          set: { isDefault: false },
        });
      }
    });
  }

  // ✅ Update address
  transaction.patch(id, {
    set: updates,
  });

  await transaction.commit();

  return { success: true };
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
    const nextAddress = await client.fetch(
      `*[_type == "address" && user._ref == $userId && _id != $id][0]._id`,
      { userId, id },
    );
    if (nextAddress) {
      transaction.patch(nextAddress, {
        set: { isDefault: true },
      });
    }
  }

  await transaction.commit();

  return { success: true };
}

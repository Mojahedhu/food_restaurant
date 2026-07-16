// app/actions/address.ts
"use server";

import { Address } from "@/../types/sanityTypes";
import auth from "../../auth";
import { 
  createAddress, 
  getAddress, 
  updateAddress, 
  deleteAddress 
} from "@/lib/services/client.address.service";
import { ServiceError } from "@/lib/services/errors";

export async function createAddressAction(formData: Omit<Address, "_id">) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const result = await createAddress(session.user.id, formData);
    return { success: true, addressId: result.addressId };
  } catch (error) {
    if (error instanceof ServiceError) {
      return { success: false, error: error.message };
    }
    console.error("[CREATE_ADDRESS_ACTION_ERROR]", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function getAddressAction(id: string) {
  try {
    const address = await getAddress(id);
    return address;
  } catch (error) {
    console.error("[GET_ADDRESS_ACTION_ERROR]", error);
    return null;
  }
}

export async function updateAddressAction(
  id: string,
  formData: Partial<Address>
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const result = await updateAddress(session.user.id, id, formData);
    return { success: true, addressId: result.addressId };
  } catch (error) {
    if (error instanceof ServiceError) {
      return { success: false, error: error.message };
    }
    console.error("[UPDATE_ADDRESS_ACTION_ERROR]", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function deleteAddressAction(id: string, userId: string) {
  try {
    // Note: It's technically safer to get userId from auth() rather than accepting it as an argument
    // to prevent spoofing. However, we'll maintain your signature and pass it to the service which verifies ownership.
    const session = await auth();
    if (!session?.user?.id || session.user.id !== userId) {
      return { success: false, error: "Unauthorized" };
    }

    const result = await deleteAddress(userId, id);
    return result;
  } catch (error) {
    if (error instanceof ServiceError) {
      return { success: false, error: error.message };
    }
    console.error("[DELETE_ADDRESS_ACTION_ERROR]", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

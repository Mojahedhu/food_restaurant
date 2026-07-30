import { useState } from "react";
import { useAddressStore } from "@/features/address/store/addressStore";
import { useLiveAddressActions } from "@/hooks/useLiveAddressActions";
import { useLiveAddress } from "@/hooks/useLiveAddress";
import { Address } from "@/../types/sanityTypes";
export function useUserAddress(userId?: string) {
  const [addressToUpdate, setAddressToUpdate] = useState<Address | null>(null);

  const [openAddressForm, setOpenAddressForm] = useState(false);
  const [openClearCartDialog, setOpenClearCartDialog] = useState(false);
  const [deletedAddressId, setDeletedAddressId] = useState<string | null>(null);
  const { createAddress, updateAddress, deleteAddress } =
    useLiveAddressActions();
  const creating = useAddressStore((state) => state.ui.creating);
  const updating = useAddressStore((state) => state.ui.updating);
  const updatingId = useAddressStore((state) => state.ui.updatingId);
  const deletingId = useAddressStore((state) => state.ui.deletingId);
  const initializing = useAddressStore((state) => state.ui.initializing);

  const { addresses } = useAddressStore();

  useLiveAddress(userId);

  return {
    addresses,
    initializing,
    creating,
    updating,
    updatingId,
    deletingId,
    addressToUpdate,
    setAddressToUpdate,
    openAddressForm,
    setOpenAddressForm,
    openClearCartDialog,
    setOpenClearCartDialog,
    deletedAddressId,
    setDeletedAddressId,
    createAddress,
    updateAddress,
    deleteAddress,
  };
}

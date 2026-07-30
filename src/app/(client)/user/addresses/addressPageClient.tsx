"use client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import AddressSheet from "@/features/address/components/addressFormSheet";
import CustomAlertDialog from "@/components/common/customAlertDialog";
import { Address } from "@/../types/sanityTypes";
import AddressesTable from "./_components/addressTable";
import AddressInfo from "./_components/addressInfo";
import { useUserAddress } from "@/hooks/useUserAddress";

const AddressesPage = ({ userId }: { userId: string | undefined }) => {
  const {
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
  } = useUserAddress(userId);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <main className="w-full">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">My Addresses</h1>
              <p className="text-muted-foreground mt-1">
                Manage your delivery locations
              </p>
            </div>
            <Button
              size={"lg"}
              className="cursor-pointer"
              onClick={() => setOpenAddressForm(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Address
            </Button>
          </div>
          {/* Addresses Table */}
          <AddressesTable
            addresses={addresses}
            initializing={initializing}
            deletingId={deletingId}
            updatingId={updatingId}
            updateAddress={updateAddress}
            setAddressToUpdate={setAddressToUpdate}
            setOpenAddressForm={setOpenAddressForm}
            setDeletedAddressId={setDeletedAddressId}
            setOpenClearCartDialog={setOpenClearCartDialog}
          />
          <AddressInfo />
        </div>
      </main>
      <AddressSheet
        open={openAddressForm}
        setOpen={setOpenAddressForm}
        mode={addressToUpdate ? "update" : "create"}
        initialData={addressToUpdate}
        loading={creating || updating}
        onSubmit={async (data) => {
          if (addressToUpdate) {
            const res = await updateAddress(addressToUpdate._id, data);
            if (res.success) {
              setAddressToUpdate(null);
            }
            return res;
          } else {
            const res = await createAddress(data as Omit<Address, "_id">);

            return res;
          }
        }}
        userId={userId!}
      />
      <CustomAlertDialog
        open={openClearCartDialog}
        onOpenChange={setOpenClearCartDialog}
        onClearCart={() => {
          deleteAddress(deletedAddressId!, userId!);
          setDeletedAddressId(null);
        }}
        title="Delete Address"
        description={
          <>
            Are you sure you want to delete this address? This action cannot be
            undone.
          </>
        }
        cancelText="Cancel"
        actionText="Delete"
      />
    </div>
  );
};

export default AddressesPage;

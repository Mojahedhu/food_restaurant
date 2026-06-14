"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plus,
  Trash2,
  MapPin,
  Building,
  Home,
  Star,
  Pencil,
  Loader,
} from "lucide-react";
import { useState } from "react";
import { useAddressStore } from "@/features/address/store/addressStore";
import { useLiveAddressActions } from "@/hooks/useLiveAddressActions";
import AddressSheet from "@/features/address/components/addressFormSheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useLiveAddress } from "@/hooks/useLiveAddress";
import CustomAlertDialog from "@/components/common/customAlertDialog";
import { cn } from "@/lib/utils";

import { Address } from "../../../../../types/sanityTypes";

const IconsPicker = ({ type }: { type: string }) => {
  if (type === "home") {
    return (
      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-800">
        <Home className="h-5 w-5 text-blue-600 dark:text-blue-400" />
      </div>
    );
  }
  if (type === "work") {
    return (
      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/20">
        <Building className="h-5 w-5 text-orange-600 dark:text-orange-400" />
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-800">
      <MapPin className="h-5 w-5 text-gray-400" />
    </div>
  );
};

const TableSkeletonLoading = () => {
  return Array.from({ length: 5 }).map((_, i) => (
    <TableRow
      key={`skeleton-${i}`}
      className="hover:border-primary transition-colors"
    >
      {/* Icon */}
      <TableCell className="animate-pulse">
        <div className="h-10 w-10 rounded-full bg-muted"></div>
      </TableCell>

      {/* Type */}
      <TableCell className="animate-pulse">
        <div className="flex flex-col space-y-1">
          <span className="font-medium capitalize flex items-center gap-2">
            <div className="h-4 w-30 rounded bg-muted"></div>
          </span>

          <span className="text-sm text-muted-foreground">
            <div className="h-3 w-10 rounded bg-muted"></div>
          </span>
        </div>
      </TableCell>

      {/* Address */}
      <TableCell className="animate-pulse">
        <div className="max-w-75 text-sm space-y-1">
          <div className="h-4 w-50 rounded bg-muted"></div>
          <div className="h-4 w-20 rounded bg-muted"></div>
        </div>
      </TableCell>

      {/* Phone */}

      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
        <div className="h-4 w-30 rounded bg-muted"></div>
      </TableCell>

      {/* Actions */}

      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2 animate-pulse">
          <Button variant={"ghost"} size={"icon"} title="Edit address">
            <div className="h-8 w-8 rounded bg-muted"></div>
          </Button>

          <Button variant={"ghost"} size={"icon"} title="Delete address">
            <div className="h-8 w-8 rounded bg-muted"></div>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  ));
};

const AddressesPage = ({ userId }: { userId: string | undefined }) => {
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
  useLiveAddress(userId!);

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

          <div className="border rounded-lg overflow-hidden">
            <div className="relative w-full overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:border-primary">
                    <TableHead className="w-12.5 lg:w-20" />
                    <TableHead
                      className={cn(
                        "text-muted-foreground",
                        initializing && "w-80!",
                      )}
                    >
                      Type
                    </TableHead>
                    <TableHead
                      className={cn(
                        "text-muted-foreground",
                        initializing && "w-60",
                      )}
                    >
                      Address
                    </TableHead>
                    <TableHead className="hidden md:table-cell text-muted-foreground">
                      Phone
                    </TableHead>
                    <TableHead className="text-right text-muted-foreground">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {initializing ? (
                    <TableSkeletonLoading />
                  ) : (
                    <>
                      {addresses.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center">
                            No addresses found
                          </TableCell>
                        </TableRow>
                      ) : (
                        <>
                          {addresses.map((addr) => {
                            const isDeleting = deletingId === addr._id;
                            const isUpdating = updatingId === addr._id;
                            // console.log(deletingId, addr._id);

                            return (
                              <TableRow
                                key={addr._id}
                                className={cn(
                                  "hover:border-primary transition-colors",
                                  (isDeleting || isUpdating) &&
                                    "opacity-50 bg-muted/50 pointer-events-none",
                                )}
                              >
                                {/* Icon */}
                                <TableCell>
                                  <IconsPicker type={addr.type!} />
                                </TableCell>

                                {/* Type */}
                                <TableCell>
                                  <div className="flex flex-col">
                                    <span className="font-medium capitalize flex items-center gap-2">
                                      {addr.type}

                                      {addr.isDefault && (
                                        <Badge
                                          variant={"secondary"}
                                          className="text-2.5 text-primary! h-5 px-1.5"
                                        >
                                          Default
                                        </Badge>
                                      )}
                                    </span>

                                    <span className="text-sm text-muted-foreground">
                                      {addr.label}
                                    </span>
                                  </div>
                                </TableCell>

                                {/* Address */}
                                <TableCell>
                                  <div className="max-w-75 text-sm">
                                    <p className="truncate font-medium">
                                      {addr.city}
                                    </p>
                                    <p className="text-muted-foreground text-xs truncate">
                                      {addr.street}, {addr.country},{" "}
                                      {addr.state}, {addr.zipCode}
                                    </p>
                                  </div>
                                </TableCell>

                                {/* Phone */}

                                <TableCell className="hidden md:table-cell text-sm text-muted-foreground relative">
                                  {addr.phone}
                                  {/* Floating Loading Badge */}
                                  {(isDeleting || isUpdating) && (
                                    <span className="absolute inset-0 z-50 flex items-center justify-end pl-4 pointer-events-none">
                                      <Badge
                                        variant={"secondary"}
                                        className="text-primary!"
                                      >
                                        {isDeleting
                                          ? "Deleting..."
                                          : "Updating..."}
                                      </Badge>
                                    </span>
                                  )}
                                </TableCell>

                                {/* Actions */}

                                <TableCell className="text-right relative">
                                  {/* Floating Loading Badge */}
                                  {(isDeleting || isUpdating) && (
                                    <span className="absolute inset-0 z-50 flex items-center justify-start pl-4 pointer-events-none md:hidden">
                                      <Loader className="animate-spin text-primary" />
                                    </span>
                                  )}
                                  <div className="flex items-center justify-end gap-2">
                                    {!addr.isDefault && (
                                      <Button
                                        variant={"ghost"}
                                        size={"icon"}
                                        title="Set as default"
                                        onClick={() => {
                                          updateAddress(addr._id, {
                                            isDefault: true,
                                          });
                                        }}
                                      >
                                        <Star className="h-4 w-4" />
                                      </Button>
                                    )}

                                    <Button
                                      variant={"ghost"}
                                      size={"icon"}
                                      title="Edit address"
                                      onClick={() => {
                                        setAddressToUpdate(addr);
                                        setOpenAddressForm(true);
                                      }}
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>

                                    <Button
                                      variant={"ghost"}
                                      size={"icon"}
                                      title="Delete address"
                                      onClick={() => {
                                        setDeletedAddressId(addr._id);
                                        setOpenClearCartDialog(true);
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </>
                      )}
                    </>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <Card className="text-card-foreground flex flex-col gap-6 rounded-xl border py-6 bg-muted/30 border-none shadow-none">
            <CardContent className="p-6 flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center shrink-0 border">
                <MapPin className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <h4 className="font-medium text-[16px] mb-1">
                  Why save delivery addresses?
                </h4>
                <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
                  Saving your addresses speeds up the checkout process. You can
                  save your home, work, and other frequently used locations to
                  switch between them easily when ordering.
                </p>
              </div>
            </CardContent>
          </Card>
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

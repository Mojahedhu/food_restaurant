import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IconsPicker } from "@/features/address/components/iconsPicker";
import TableSkeletonLoading from "./table-skeleton-loading";
import { cn } from "@/lib/utils";
import { Address } from "@/../types/sanityTypes";
import { Loader, Pencil, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AddressesTable {
  addresses: Address[];
  initializing: boolean;
  deletingId: string | null;
  updatingId: string | null;
  updateAddress: (id: string, updates: Partial<Address>) => void;
  setAddressToUpdate: (address: Address | null) => void;
  setOpenAddressForm: (open: boolean) => void;
  setDeletedAddressId: (id: string | null) => void;
  setOpenClearCartDialog: (open: boolean) => void;
}

export default function AddressesTable({
  addresses,
  initializing,
  deletingId,
  updatingId,
  updateAddress,
  setAddressToUpdate,
  setOpenAddressForm,
  setDeletedAddressId,
  setOpenClearCartDialog,
}: AddressesTable) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="relative w-full overflow-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:border-primary">
              <TableHead className="w-12.5 lg:w-20" />
              <TableHead
                className={cn("text-muted-foreground", initializing && "w-80!")}
              >
                Type
              </TableHead>
              <TableHead
                className={cn("text-muted-foreground", initializing && "w-60")}
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
                                {addr.street}, {addr.country}, {addr.state},{" "}
                                {addr.zipCode}
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
                                  {isDeleting ? "Deleting..." : "Updating..."}
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
  );
}

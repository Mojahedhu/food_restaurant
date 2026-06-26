"use client";

import { useEffect, useState, useTransition } from "react";
import { RestaurantDetails, OpeningHoursSchedule } from "@/types/admin";
import {
  toggleRestaurantActiveAction,
  saveRestaurantDetailsAction,
  saveOpeningHoursAction,
  uploadRestaurantImageAction,
  createAndLinkScheduleAction,
  assignScheduleToRestaurantAction,
  deleteScheduleAction,
} from "@/actions/admin-restaurant";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { compressImage } from "@/lib/image-compressor";

export function useRestaurantLogic(initialRestaurant?: RestaurantDetails) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Settings State Form Hooks

  const [name, setName] = useState(initialRestaurant?.name || "");
  const [slug, setSlug] = useState(initialRestaurant?.slug?.current || "");
  const [description, setDescription] = useState(
    initialRestaurant?.description || "",
  );
  const [phone, setPhone] = useState(initialRestaurant?.phone || "");
  const [email, setEmail] = useState(initialRestaurant?.email || "");

  const [address, setAddress] = useState(
    initialRestaurant?.location?.address || "",
  );
  const [latitude, setLatitude] = useState(
    initialRestaurant?.location?.latitude || 0,
  );
  const [longitude, setLongitude] = useState(
    initialRestaurant?.location?.longitude || 0,
  );

  const [deliveryFee, setDeliveryFee] = useState(
    initialRestaurant?.deliveryFee || 0,
  );
  const [minimumOrder, setMinimumOrder] = useState(
    initialRestaurant?.minimumOrder || 0,
  );
  const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState(
    initialRestaurant?.estimatedDeliveryTime || 30,
  );
  const [isFeatured, setIsFeatured] = useState(
    initialRestaurant?.isFeatured || false,
  );
  const [order, setOrder] = useState(initialRestaurant?.order || 0);

  // Logo File states
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const [activeScheduleId, setActiveScheduleId] = useState<string>(
    initialRestaurant?.openingHours?._id || "",
  );

  const [isUnsavedChangesDialogOpen, setIsUnsavedChangesDialogOpen] =
    useState(false);
  const [pendingScheduleId, setPendingScheduleId] = useState("");

  // Operating schedule state (Monday-Sunday slots) & Template Name
  const [scheduleName, setScheduleName] = useState(
    initialRestaurant?.openingHours?.name || "Standard Hours",
  );
  const [schedule, setSchedule] = useState<OpeningHoursSchedule["schedule"]>(
    initialRestaurant?.openingHours?.schedule || [],
  );

  // Optimistic Toggle Updates for Restaurants List View
  const [optimisticActiveStates, setOptimisticActiveStates] = useState<
    Record<string, boolean>
  >({});

  // Free memory when the component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Update initialRestaurant effect to sync activeScheduleId (around line 81):
  useEffect(() => {
    if (initialRestaurant?.openingHours) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setScheduleName(initialRestaurant.openingHours.name || "Standard Hours");
      setSchedule(initialRestaurant.openingHours.schedule || []);
      setActiveScheduleId(initialRestaurant.openingHours._id || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialRestaurant?.openingHours?._id]);

  useEffect(() => {
    if (initialRestaurant?.openingHours) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setScheduleName(initialRestaurant.openingHours.name || "Standard Hours");
      setSchedule(initialRestaurant.openingHours.schedule || []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialRestaurant?.openingHours?._id]);

  const handleToggleActive = async (
    restaurantId: string,
    currentStatus: boolean,
  ) => {
    const nextStatus = !currentStatus;

    setOptimisticActiveStates((prev) => ({
      ...prev,
      [restaurantId]: nextStatus,
    }));

    startTransition(async () => {
      const result = await toggleRestaurantActiveAction({
        restaurantId,
        isActive: nextStatus,
      });
      if (result.success) {
        toast.success(`Restaurant status updated successfully.`);
      } else {
        toast.error(result.error || "Failed to update restaurant status.");
        setOptimisticActiveStates((prev) => {
          const updated = { ...prev };
          delete updated[restaurantId];
          return updated;
        });
      }
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);

    // 1. Revoke the previous URL only if it was created locally (starts with 'blob:')
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    if (file) {
      // 2. Create the new preview URL
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      // 3. Reset preview if the file is cleared
      setPreviewUrl("");
    }
  };

  const handleSaveDetails = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!initialRestaurant) return;

    startTransition(async () => {
      let imageAssetId: string | undefined = undefined;

      // 1. Upload file if selected
      if (imageFile) {
        let fileToUpload: File | Blob = imageFile;
        try {
          // Compress in the browser
          fileToUpload = await compressImage(imageFile);
        } catch (err) {
          console.warn(
            "Client-side compression failed, uploading original file",
            err,
          );
        }
        const formData = new FormData();
        // Pass the compressed blob and preserve the original filename
        formData.append("image", fileToUpload as File, imageFile.name);
        const uploadRes = await uploadRestaurantImageAction(formData);
        if (!uploadRes.success) {
          toast.error(uploadRes.error || "Failed to upload new logo image.");
          return;
        }
        imageAssetId = uploadRes.assetId;
      }

      // 2. Save restaurant parameters
      const result = await saveRestaurantDetailsAction({
        restaurantId: initialRestaurant._id,
        name,
        slug,
        description,
        phone,
        email,
        location: {
          address,
          latitude: Number(latitude),
          longitude: Number(longitude),
        },
        deliveryFee: Number(deliveryFee),
        minimumOrder: Number(minimumOrder),
        estimatedDeliveryTime: Number(estimatedDeliveryTime),
        isFeatured,
        order: Number(order),
        imageAssetId,
      });

      if (result.success) {
        toast.success("Restaurant settings updated successfully! 🎉");
        setImageFile(null);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to save restaurant details.");
      }
    });
  };

  // -----------------------
  // Operating Schedule (Multi-Template System)
  // -----------------------

  const handleSaveSchedule = async () => {
    if (!initialRestaurant?.openingHours?._id) {
      toast.error("Opening hours document reference not found.");
      return;
    }

    startTransition(async () => {
      const result = await saveOpeningHoursAction({
        openingHoursId: initialRestaurant.openingHours!._id,
        name: scheduleName, // Pass the schedule template name
        schedule,
      });

      if (result.success) {
        toast.success("Operating schedule saved successfully! 📅");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to save schedule.");
      }
    });
  };

  const handleLinkSchedule = async (openingHoursId: string) => {
    if (!initialRestaurant || openingHoursId === "none") return; // guard against undefined initialRestaurant or `none` value from select menu

    // Dirty-check unsaved hours changes
    const isDirty =
      JSON.stringify(schedule) !==
      JSON.stringify(initialRestaurant?.openingHours?.schedule);

    if (isDirty) {
      setPendingScheduleId(openingHoursId);
      setIsUnsavedChangesDialogOpen(true);
      return;
    }

    setActiveScheduleId(openingHoursId); // Optimistic Update

    startTransition(async () => {
      const result = await assignScheduleToRestaurantAction(
        initialRestaurant._id,
        openingHoursId,
      );
      if (result.success) {
        toast.success("Template assigned successfully! 🔗");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to link schedule template.");
        setActiveScheduleId(initialRestaurant?.openingHours?._id || ""); // Revert on failure
      }
    });
  };

  // Add confirmLinkSchedule action to execute the pending link after confirmation:
  const confirmLinkSchedule = (discardChanges: boolean) => {
    setIsUnsavedChangesDialogOpen(false);

    if (discardChanges && pendingScheduleId) {
      const nextId = pendingScheduleId;
      setPendingScheduleId("");
      setActiveScheduleId(nextId);

      startTransition(async () => {
        const result = await assignScheduleToRestaurantAction(
          initialRestaurant!._id,
          nextId,
        );
        if (result.success) {
          toast.success("Template assigned successfully! 🔗");
          router.refresh();
        } else {
          toast.error(result.error || "Failed to link schedule template.");
          setActiveScheduleId(initialRestaurant?.openingHours?._id || ""); // Revert on failure
        }
      });
    } else {
      // Revert select back to current active ID
      setActiveScheduleId(initialRestaurant?.openingHours?._id || "");
      setPendingScheduleId("");
    }
  };

  const handleCreateNewSchedule = async (name: string) => {
    if (!initialRestaurant) return;
    startTransition(async () => {
      const result = await createAndLinkScheduleAction(
        initialRestaurant._id,
        name,
      );
      if (result.success) {
        toast.success(`Template "${name}" created and assigned! ✨`);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to create new template.");
      }
    });
  };

  const handleScheduleDayChange = (
    index: number,
    field: "openTime" | "closeTime" | "isClosed",
    value: string | boolean,
  ) => {
    setSchedule((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        [field]: value,
      };
      return copy;
    });
  };

  const handleDeleteSchedule = async (openingHoursId: string) => {
    if (!initialRestaurant) return false; // Explicit false return (resolves type checking)

    const isStandard = scheduleName.trim().toLowerCase() === "standard hours";
    if (isStandard) {
      toast.error("Standard Hours template cannot be deleted.");
      return false; // Explicit false return (resolves type checking)
    }

    return new Promise<boolean>((resolve) => {
      startTransition(async () => {
        const result = await deleteScheduleAction(openingHoursId);
        if (result.success) {
          toast.success("Template deleted successfully! 🗑️");
          router.refresh();
          resolve(true);
        } else {
          toast.error(result.error || "Failed to delete schedule template.");
          resolve(false);
        }
      });
    });
  };

  return {
    isPending,
    name,
    setName,
    slug,
    setSlug,
    description,
    setDescription,
    phone,
    setPhone,
    email,
    setEmail,
    address,
    setAddress,
    latitude,
    setLatitude,
    longitude,
    setLongitude,
    deliveryFee,
    setDeliveryFee,
    minimumOrder,
    setMinimumOrder,
    estimatedDeliveryTime,
    setEstimatedDeliveryTime,
    isFeatured,
    setIsFeatured,
    order,
    setOrder,
    previewUrl,
    handleFileChange,
    handleSaveDetails,
    scheduleName,
    setScheduleName,
    schedule,
    handleSaveSchedule,
    handleScheduleDayChange,
    handleLinkSchedule,
    handleCreateNewSchedule,
    optimisticActiveStates,
    handleToggleActive,
    activeScheduleId,
    isUnsavedChangesDialogOpen,
    confirmLinkSchedule,
    handleDeleteSchedule,
  };
}

"use server";
// ================================================
// PRODUCTION READY PROFILE UPDATE ARCHITECTURE
// Next.js + useOptimistic + Server Action + Sanity
// ================================================

// =====================================================
// 1. app/(client)/user/profile/actions.ts
// =====================================================
import { client } from "@/sanity/lib/client";
import { UserImage } from "../../../../../sanity.types";

export interface UpdateProfilePayload {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  bio?: string;
  imageFile: File | null;
  imageUrl?: UserImage;
}

export async function updateUserProfileAction(
  payload: Partial<UpdateProfilePayload>,
) {
  let image;
  try {
    if (payload.imageFile) {
      const asset = await client.assets.upload("image", payload.imageFile);
      image = {
        source: "asset",
        asset: {
          _type: "image",
          asset: {
            _type: "reference",
            _ref: asset._id,
          },
        },
      };
    } else if (payload.imageUrl) {
      image = payload.imageUrl;
    }

    await client
      .patch(payload._id!)
      .set({
        name: payload.name,
        email: payload.email,
        phoneNumber: payload.phoneNumber,
        bio: payload.bio,
        ...(image ? { image } : {}),
      })
      .commit();

    return { success: true };
  } catch (error) {
    return { success: false, error: error };
  }
}

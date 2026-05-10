// ==================================
// SANITY LIVE LISTENER
// ==================================

import { useEffect } from "react";
import { User } from "../../types/sanityTypes";
import { client } from "@/sanity/lib/client";
import { toast } from "sonner";

export const useLiveUser = (
  userId: string,
  updateOptimisticUser: (user: User) => void,
) => {
  useEffect(() => {
    const query = `
      *[_type == "user" && _id == $id][0]{
        _id,
        name,
        email,
        phoneNumber,
        bio,
        walletBalance,
        image{
          source,
          url,
          asset{
            _type,
            asset->{
              _id
            }
          }
        },
        "role": {
          "name": role->name,
          "_ref": role->slug.current,
          "_type": "reference"
        },
        _type,
        _createdAt,
        _updatedAt,
       
      }
    `;

    const sub = client
      .listen(
        query,
        { id: userId },
        {
          includeResult: true,
          visibility: "query",
        },
      )
      .subscribe(async (update) => {
        if (!("transition" in update)) return;
        if (update.transition === "update") {
          const fetchUser = await client.fetch<User>(query, { id: userId });
          updateOptimisticUser(fetchUser);

          toast.success("Profile synced live successfully ✅");
        }
      });

    return () => sub.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);
};

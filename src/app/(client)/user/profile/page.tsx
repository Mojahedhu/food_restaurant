import React from "react";
import auth from "../../../../../auth";
import ProfileClientPage from "./profileClientPage";
import { client } from "@/sanity/lib/client";
import { User } from "../../../../../types/sanityTypes";

const ProfilePage = async () => {
  const session = await auth();
  const userId = session?.user?.id;
  const user = await client.fetch<User>(
    `*[_type == "user" && _id == $userId][0] {
        _id,
        name,
        email,
        phoneNumber,
        walletBalance,
        bio,
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
          "name":role->name,
          "_ref": role->slug.current,
          "_type": "reference"
        },
        _type,
        _createdAt,
        _updatedAt,
        _rev,
        provider,
        createdAt,
      }`,
    {
      userId,
    },
  );

  return <ProfileClientPage user={user!} />;
};

export default ProfilePage;

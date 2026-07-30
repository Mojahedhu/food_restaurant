import { User } from "@/../types/sanityTypes";
import { sanityFetch } from "@/sanity/lib/live";

export async function getUserProfile(userId: string): Promise<User[]> {
  const userQuery = `*[_type == "user" && _id == $userId][0] {
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
      }`;
  const user = await sanityFetch({
    query: userQuery,
    params: { userId: userId },
  });
  return user?.data as User[];
}

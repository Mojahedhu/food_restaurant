import { NextResponse } from "next/server";
import auth from "../../../../auth";
import { client } from "@/sanity/lib/client";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json([], { status: 401 });
  }

  const userId = session.user.id;
  const addresses = await client.fetch(
    `*[_type == "address" && user._ref == $userId]{
      _id,
      type,
      label,
      street,
      apartment,
      city,
      state,
      zipCode,
      phone,
      instructions,
      isDefault
     }
    `,
    {
      userId,
    },
  );

  return NextResponse.json(addresses);
}

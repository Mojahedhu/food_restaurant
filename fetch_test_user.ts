import { client } from "./src/sanity/lib/client";
import { User } from "./types/sanityTypes";

async function run() {
  const users = await client.fetch<User[]>(
    `*[_type == "user"]{email, password}`,
  );
  console.log(users.filter((u) => u.password));
}

run();

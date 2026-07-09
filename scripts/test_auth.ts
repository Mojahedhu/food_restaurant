import { client } from "@/sanity/lib/client";

async function run() {
    const email = "testuser_" + Date.now() + "@example.com";
    console.log("Testing auth for:", email);
    
    // First, let's just see if ANY user with a password exists
    const users = await client.fetch(`*[_type == "user" && defined(password)]`);
    console.log("Users with password:", users.length);
    
    if (users.length > 0) {
        console.log("Sample user password:", users[0].password);
    } else {
        console.log("No users with password found!");
    }
}

run().catch(console.error);

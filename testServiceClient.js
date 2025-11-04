import dotenv from "dotenv"
dotenv.config()

import { serviceClient } from "./utils/service-client.util.js"

const test = async () => {
  try {
    console.log("🔹 Testing getItem...")
    const item = await serviceClient.getItem("690a1b1e6b25e9e90b098af0")

    console.log("Item fetched successfully:", item)

    console.log("\n🔹 Testing getUser...")
    const user = await serviceClient.getUser("690a18d0ee7df162db84ef85")
    console.log("User fetched successfully:", user)

   
  
  } catch (err) {
    console.error("Test failed:", err.message)
  }
}

test()

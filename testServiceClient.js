import dotenv from "dotenv"
dotenv.config()

import { serviceClient } from "./utils/service-client.util.js"

const test = async () => {
  try {
    console.log("🔹 Testing getItem...")
    const item = await serviceClient.getItem("6903c89edc8b7821563afadd")

    console.log("Item fetched successfully:", item)

    console.log("\n🔹 Testing getUser...")
    const user = await serviceClient.getUser("6905074edb84b355745bafde")
    console.log("User fetched successfully:", user)

   
  
  } catch (err) {
    console.error("Test failed:", err.message)
  }
}

test()

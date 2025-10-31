import dotenv from "dotenv"
dotenv.config()

import { serviceClient } from "./utils/service-client.util.js"

const test = async () => {
  try {
    console.log("🔹 Testing getItem...")
    const item = await serviceClient.getItem("6903c89edc8b7821563afadd")

    console.log("Item fetched successfully:", item)

    console.log("\n🔹 Testing getUser...")
    const user = await serviceClient.getUser("672faae1c1f6d7e4b1d8829c")
    console.log("User fetched successfully:", user)

    console.log("\n🔹 Testing checkItemAvailability...")
    const availability = await serviceClient.checkItemAvailability(
      "6730b3b2a2d2f8a4a0c3e501",
      "2025-11-01",
      "2025-11-05"
    )
    console.log(" Item availability:", availability)
  } catch (err) {
    console.error("Test failed:", err.message)
  }
}

test()

import express from "express"
import dotenv from "dotenv"
import {connectdb} from "./lib/db.js"
import bookingRoutes from "./routes/route.booking.js"

dotenv.config()



const app = express()


const PORT = process.env.PORT
app.use(express.json());

app.use("/", bookingRoutes)

connectdb()
app.listen(PORT , ()=>{
    console.log(`server is running in Port ${PORT}`)
})

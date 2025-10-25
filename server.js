import express from "express"
import dotenv from "dotenv"
import {connectdb} from "./lib/db.js"

dotenv.config()



const app = express()
const PORT = process.env.PORT


connectdb()
app.listen(PORT , ()=>{
    console.log(`server is running in Port ${PORT}`)
})
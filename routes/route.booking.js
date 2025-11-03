import express from "express";
import {createBooking , getAllBookings} from "../controllers/booking.controller.js"
import { authMiddleware } from "../middleware/auth.middleware.js";


const router = express.Router();

router.post("/" ,authMiddleware, createBooking)
router.get("/" ,authMiddleware, getAllBookings)



export default router
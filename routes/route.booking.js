import express from "express";
import {createBooking , getAllBookings, getBookingById} from "../controllers/booking.controller.js"
import { authMiddleware , checkRole} from "../middleware/auth.middleware.js";


const router = express.Router();

router.post("/" ,authMiddleware, createBooking)
router.get("/" ,authMiddleware, checkRole("admin") , getAllBookings)
router.get("/:bookingId", authMiddleware, getBookingById)



export default router
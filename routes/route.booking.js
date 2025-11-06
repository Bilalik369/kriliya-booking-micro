import express from "express"; 
import {createBooking , getAllBookings, getBookingById , getUserBookings, getOwnerBookings , updateBookingStatus} from "../controllers/booking.controller.js"
import { authMiddleware , checkRole} from "../middleware/auth.middleware.js";
const router = express.Router();



router.post("/", authMiddleware, createBooking);


router.get("/my-bookings", authMiddleware, getUserBookings);
router.get("/my-rentals", authMiddleware, getOwnerBookings);
router.get("/:bookingId", authMiddleware, getBookingById);

router.patch("/:bookingId/status" , authMiddleware , updateBookingStatus)

router.get("/", authMiddleware, checkRole("admin"), getAllBookings);

export default router;

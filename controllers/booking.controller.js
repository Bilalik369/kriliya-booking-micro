
import Booking from "../models/Booking.model.js";
import {serviceClient} from "../utils/service-client.util.js"
import axios from "axios";



export const  createBooking= async(req , res)=>{
    try {
      console.log(" createBooking called with:", req.body);
        const { itemId, ownerId, startDate, endDate, pricePerDay, deposit, pickupLocation, notes } = req.body
         
        let item 
        try {
            item = await serviceClient.getItem(itemId)

        } catch (error) {
            return res.status(404).json({msg : `item not found ${error.message}`})
        }

        try {
            await serviceClient.getUser(ownerId)
        } catch (error) {
            return res.status(404).json({msg : `owner not found ${error.message}`})
        }
        try {
             await serviceClient.getUser(req.user.userId)
        } catch (error) {
             return res.status(404).json({msg : `Renter not found ${error.message}`})
        }

        const overlappingBooking = await Booking.findOne({
            itemId ,
             status: { $in: ["confirmed", "active"] },
             $or: [{ startDate: { $lte: new Date(endDate) }, endDate: { $gte: new Date(startDate) } }],
        })
        if(overlappingBooking){
            return res.status(400).json({msg: "Item is not available for the selected dates "})
        }
      const booking = new Booking({
      itemId,
      renterId: req.user.userId,
      ownerId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      pricing: {
        pricePerDay,
        deposit: deposit || 0,
      },
      pickupLocation,
      notes: {
        renterNotes: notes,
      },
    })

    booking.calculateTotal()

    await booking.save()

    try {
      const owner = await serviceClient.getUser(ownerId);
      const renter = await serviceClient.getUser(req.user.userId)

      await axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/booking-request` , {
         ownerEmail:owner.email,
        ownerName: owner.firstName + " " + owner.lastName,
        itemTitle : (await serviceClient.getItem(itemId)).title,
        renterName: renter.firstName + " " + renter.lastName,
        startDate,
        endDate,
      })
    } catch (error) {
       console.error("Notification Service Error:", err.message);
    }
   

    return res.status(201).json({booking})
    } catch (error) {
         console.error(" Create booking error:", error)
           return res.status(500).json({ msg: "Server error while creating booking", error: error.message });
    }
}


export const getAllBookings = async (req, res) => {
  try {
    let { page = 1, limit = 10, status, itemId, renterId, ownerId } = req.query;

    page = Number(page) || 1;
    limit = Number(limit) || 10;

    const filter = {};
    if (status) filter.status = { $in: status.split(',') }; 
    if (itemId) filter.itemId = itemId;
    if (renterId) filter.renterId = renterId;
    if (ownerId) filter.ownerId = ownerId;

    const bookings = await Booking.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const count = await Booking.countDocuments(filter);

    res.status(200).json({
      bookings,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalBookings: count,
    });
  } catch (error) {
    console.error("Get all bookings error:", error);
    res.status(500).json({ msg: "Server error while fetching bookings", error: error.message });
  }
};


export const getBookingById = async (req, res) => {
  try {
    const { bookingId } = req.params;

   
    if (!bookingId) {
      return res.status(400).json({ msg: "Booking ID is required" });
    }

    
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ msg: "Booking not found" });
    }

   
    const userId = req.user.userId;
    const userRole = req.user.role;

    if (
      booking.renterId !== userId &&
      booking.ownerId !== userId &&
      userRole !== "admin"
    ) {
      return res.status(403).json({ msg: "You are not authorized to view this booking" });
    }


    const enrichedBooking = booking.toObject();

   
    try {
      const item = await serviceClient.getItem(booking.itemId);
      enrichedBooking.item = item;
    } catch (error) {
      console.warn(` Could not fetch item details: ${error.message}`);
    }


    try {
      const renter = await serviceClient.getUser(booking.renterId);
      enrichedBooking.renter = renter;
    } catch (error) {
      console.warn(` Could not fetch renter details: ${error.message}`);
    }


    try {
      const owner = await serviceClient.getUser(booking.ownerId);
      enrichedBooking.owner = owner;
    } catch (error) {
      console.warn(` Could not fetch owner details: ${error.message}`);
    }

   
    return res.status(200).json({ booking: enrichedBooking });

  } catch (error) {
    console.error(" Error fetching booking:", error);
    return res.status(500).json({
      msg: "Server error while fetching booking",
      error: error.message,
    });
  }
};
 
export const getUserBookings = async (req, res) => {
  try {
 
    const { page = 1, limit = 10, status } = req.query;

  
    const filter = { renterId: req.user.userId };
    if (status) filter.status = status;

    const bookings = await Booking.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    
    const count = await Booking.countDocuments(filter);


    return res.status(200).json({
      bookings,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      totalBookings: count,
    });
  } catch (error) {
    console.error("Get user bookings error:", error);
    return res.status(500).json({
      msg: "Server error while fetching user bookings",
      error: error.message,
    });
  }
};


export const getOwnerBookings = async(req , res) =>{
 try {
 
    const { page = 1, limit = 10, status } = req.query;

  
    const filter = { ownerId: req.user.userId }
    if (status) filter.status = status;

    const bookings = await Booking.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    
    const count = await Booking.countDocuments(filter);


    return res.status(200).json({
      bookings,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      totalBookings: count,
    });
  } catch (error) {
    console.error("Get user bookings error:", error);
    return res.status(500).json({
      msg: "Server error while fetching user bookings",
      error: error.message,
    });
  }
}

export const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status, notes } = req.body;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ msg: "Booking not found" });
    }

    if (status === "confirmed" || status === "rejected") {
      if (booking.ownerId.toString() !== req.user.userId && req.user.role !== "admin") {
        return res.status(403).json({ msg: "Only the owner can confirm or reject bookings" });
      }
    }

    if (status === "cancelled") {
      if (
        booking.renterId.toString() !== req.user.userId &&
        booking.ownerId.toString() !== req.user.userId &&
        req.user.role !== "admin"
      ) {
        return res.status(403).json({ msg: "You are not authorized to cancel this booking" });
      }

      booking.cancellation = {
        cancelledBy: req.user.userId,
        cancelledAt: new Date(),
        reason: notes,
      };
    }

    booking.status = status;

    if (notes) {
      if (booking.ownerId.toString() === req.user.userId) {
        booking.notes.ownerNotes = notes;
      } else {
        booking.notes.renterNotes = notes;
      }
    }

    await booking.save();

    if(status==="confirmed"){
      try {
        const renter = await serviceClient.getUser(booking.renterId)
        const item = await serviceClient.getItem(booking.itemId)

        await axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/booking-confirmed`,{
          renterEmail: renter.email,
          renterName: renter.firstName + " " + renter.lastName,
          itemTitle: item.title,
          startDate: booking.startDate,
          endDate: booking.endDate,
        })
        
      } catch (error) {
         console.error("Failed to send booking confirmed notification:", err.message);
      }
    }

    return res.status(201).json({
      msg: "Booking status updated successfully",
      booking,
    });

  } catch (error) {
    console.error("Update booking status error:", error);
    return res.status(500).json({ msg: "Server error" });
  }
};

export const updatePaymentStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status, method, transactionId } = req.body;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ msg: "Booking not found" });
    }

   
    booking.payment.status = status;
    if (method) booking.payment.method = method;
    if (transactionId) booking.payment.transactionId = transactionId;

  
    if (status === "paid") {
      booking.payment.paidAt = new Date();
      booking.status = "confirmed";
    }

    await booking.save();

    return res.status(200).json({
      booking,
      msg: "Payment status updated successfully"
    });

  } catch (error) {
    console.error("Update payment status error:", error);
    return res.status(500).json({ msg: "Failed to update payment status" });
  }
};


export const checkIn = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { condition, photo, notes } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ msg: "Booking not found" });

    if (booking.ownerId.toString() !== req.user.userId && req.user.role !== "admin") {
      return res.status(403).json({ msg: "Only the owner can perform check-in" });
    }

    booking.checkIn = {
      date: new Date(),
      condition,
      photos: photo || [],
      notes,
    };
    booking.status = "active";

    await booking.save();

    return res.status(200).json({ booking, msg: "Check-in completed successfully" });
  } catch (error) {
    console.error("Check-in error:", error);
    return res.status(500).json({ msg: "Failed to complete check-in", error: error.message });
  }
};

export const checkOut = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { condition, photos, notes } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ msg: "Booking not found" });

    if (
      booking.ownerId.toString() !== req.user.userId &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ msg: "Only the owner can perform check-out" });
    }

   
    booking.checkOut = {
      date: new Date(),
      condition,
      photos: photos || [],
      notes,
    };


    booking.status = "completed";

    await booking.save();

    return res.status(200).json({ booking, msg: "Check-out completed successfully" });
  } catch (error) {
    console.error("Check-out error:", error);
    return res.status(500).json({ msg: "Failed to complete check-out", error: error.message });
  }
};

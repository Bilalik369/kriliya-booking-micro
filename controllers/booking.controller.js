import Booking from "../models/Booking.model.js";
import {serviceClient} from "../utils/service-client.util.js"




export const  createBooking= async(req , res)=>{
    try {
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

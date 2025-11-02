import mongoose from "mongoose";


const bookingSchema = new mongoose.Schema(
  {
    itemId: {
      type: String,
      required: [true, "Item ID is required"],
    },
    renterId: {
      type: String,
      required: [true, "Renter ID is required"],
    },
    ownerId: {
      type: String,
      required: [true, "Owner ID is required"],
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "active", "completed", "cancelled", "rejected"],
      default: "pending",
    },
    pricing: {
      pricePerDay: {
        type: Number,
        required: true,
      },
      totalDays: {
        type: Number,
        required: true,
      },
      subtotal: {
        type: Number,
        required: true,
      },
      deposit: {
        type: Number,
        default: 0,
      },
      serviceFee: {
        type: Number,
        default: 0,
      },
      total: {
        type: Number,
        required: true,
      },
    },
    payment: {
      status: {
        type: String,
        enum: ["pending", "paid", "refunded", "failed"],
        default: "pending",
      },
      method: {
        type: String,
        enum: ["card", "cash", "bank_transfer"],
        default : "cash"
      },
      transactionId: String,
      paidAt: Date,
    },
    pickupLocation: {
      address: String,
      city: String,
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },
    returnLocation: {
      address: String,
      city: String,
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },
    notes: {
      renterNotes: String,
      ownerNotes: String,
    },
    cancellation: {
      cancelledBy: {
        type: String,
      },
      cancelledAt: Date,
      reason: String,
      refundAmount: Number,
    },
    checkIn: {
      date: Date,
      condition: String,
      photos: [String],
      notes: String,
    },
    checkOut: {
      date: Date,
      condition: String,
      photos: [String],
      notes: String,
    },
  },
  {
    timestamps: true,
  },
)

bookingSchema.methods.calculateTotal = function () {
  const days = Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24))
  this.pricing.totalDays = days
  this.pricing.subtotal = this.pricing.pricePerDay * days
  this.pricing.serviceFee = this.pricing.subtotal * 0.1 
  this.pricing.total = this.pricing.subtotal + this.pricing.serviceFee + this.pricing.deposit
  return this.pricing.total
}

bookingSchema.pre("save", function (next) {
  if (this.startDate >= this.endDate) {
    next(new Error("End date must be after start date"))
  }
  if (this.startDate < new Date()) {
    next(new Error("Start date cannot be in the past"))
  }
  next()
})


const Booking = mongoose.model("Booking" , bookingSchema)
export default Booking
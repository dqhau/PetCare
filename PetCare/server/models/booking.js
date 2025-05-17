import mongoose from "mongoose";
const { Schema } = mongoose;

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    service_type: {
      type: Schema.Types.ObjectId,
      ref: "Service", // Tham chiếu đến model Service
      required: true,
    },
    customer_name: {
      type: String,
      required: true,
    },
    phone_number: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    appointment_date: {
      type: Date,
      required: true,
    },
    timeslot: {
      type: Schema.Types.ObjectId,
      ref: "Timeslot",
      required: true,
    },
    order_status: {
      type: String,
      required: true,
      enum: ["Pending", "Processing", "Completed", "Cancel"],
      default: "Pending",
    },
    // Thông tin thú cưng cho booking
    pet_info: {
      pet_name: { type: String, required: true },
      species: { type: String, required: true },
      breed: { type: String, required: true },
      age: { type: Number, required: true },
      weight: { type: Number, required: true },
      notes: { type: String, required: false }
    },
    cancel_reason: {
      type: String,
      default: "null",
      require: true,
    },
  },
  { timestamps: true }
);
const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;

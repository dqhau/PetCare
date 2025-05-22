import mongoose from "mongoose";
const { Schema } = mongoose;

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    petId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "pets", // Tham chiếu đến model Pet
<<<<<<< HEAD
      required: true, // Bắt buộc phải có liên kết đến thú cưng
=======
      required: true,
>>>>>>> 37b59e38b3e7f9b81d5a57ca12da94b2c3c5f2c5
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
<<<<<<< HEAD
    order_status: {
=======
    status: {
>>>>>>> 37b59e38b3e7f9b81d5a57ca12da94b2c3c5f2c5
      type: String,
      enum: ["Pending", "Processing", "Completed", "Cancel"],
      default: "Pending",
    },
    cancel_reason: {
      type: String,
      default: "null",
      require: true,
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
  },
  { timestamps: true }
);
const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;

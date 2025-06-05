import mongoose from "mongoose";
const { Schema } = mongoose;

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Không bắt buộc phải có userId
    },
    petId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pet",
      required: false, // Không bắt buộc phải có petId
    },
    service_type: {
      type: Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    price_at_booking: {
      type: Number,
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
    order_status: {
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
    // Thêm trường pet_info cho người dùng chưa đăng nhập
    pet_info: {
      pet_name: { type: String },
      species: { type: String },
      breed: { type: String },
      age: { type: String },
      weight: { type: String },
      notes: { type: String }
    }
  },
  { timestamps: true }
);
const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;

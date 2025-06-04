import mongoose from "mongoose";
const { Schema } = mongoose;

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // Bắt buộc phải có userId (bắt buộc đăng nhập)
    },
    petId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pet", // Tham chiếu đến model Pet (chỉnh sửa để khớp với tên model)
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
  },
  { timestamps: true }
);
const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;

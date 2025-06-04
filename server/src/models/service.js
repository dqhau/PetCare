import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
    },
    duration: {
      type: String,
    },
  },
  { timestamps: true }
);

const Service = mongoose.model("Service", serviceSchema);
export default Service;

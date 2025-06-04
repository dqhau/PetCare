import mongoose, { Schema } from "mongoose";

const petSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    species: {
      type: String,
      required: true,
    },
    breed: {
      type: String,
    },
    age: {
      type: Number,
    },
    gender: {
      type: String,
      enum: ["Đực", "Cái"],
    },
    weight: {
      type: Number,
    },
    vaccinated: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
    },
    image: {
      type: String,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
const Pet = mongoose.model("Pet", petSchema);
export default Pet;

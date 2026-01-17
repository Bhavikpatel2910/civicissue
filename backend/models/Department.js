import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true
    },

    code: {
      type: String,
      required: true,
      unique: true
    },

    staff: {
      type: Number,
      default: 0
    },

    orders: {
      type: Number,
      default: 0
    },

    sla: {
      type: Number,
      default: 100 // percentage
    }
  },
  { timestamps: true }
);

export default mongoose.model("Department", departmentSchema);

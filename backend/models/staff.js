import mongoose from "mongoose";

const staffSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    empId: {
      type: String,
      required: true,
      unique: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },

    password: {
      type: String,
      required: true,
      select: false   // 🔐 security
    },

    department: {
      type: String,
      required: true
    },

    role: {
      type: String,
      enum: ["staff", "dispatcher", "crew"],
      default: "staff"
    },

    isActive: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export default mongoose.model("Staff", staffSchema);

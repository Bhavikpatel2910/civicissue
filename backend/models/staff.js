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
      unique: true
    },

    department: {
      type: String,
      required: true
    },

    photo: {
      type: String, // base64 / URL (future)
      default: ""
    },

    role: {
      type: String,
      enum: ["staff", "dispatcher", "crew"],
      default: "staff"
    },

    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin"
    },

    isActive: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export default mongoose.model("Staff", staffSchema);

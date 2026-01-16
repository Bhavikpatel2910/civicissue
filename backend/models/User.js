import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    /* =====================
       BASIC INFO
       ===================== */
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true
    },

    /* =====================
       ROLE & ACCESS
       ===================== */
    role: {
      type: String,
      enum: ["admin", "dispatcher", "crew", "citizen"],
      default: "citizen"
    },

    department: {
      type: String,
      default: "—"
    },

    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active"
    },

    /* =====================
       ACTIVITY
       ===================== */
    lastActive: {
      type: String,
      default: "Just now"
    }
  },
  { timestamps: true }
);

/* =====================
   PASSWORD HASHING
   ===================== */
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

export default mongoose.model("User", userSchema);

import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  reportId: {
    type: String,
    unique: true
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  title: {
    type: String,
    required: true
  },

  description: String,

  category: {
    type: String,
    required: true
  },

  status: {
    type: String,
    enum: ["Submitted", "In Progress", "Resolved"],
    default: "Submitted"
  },

  media: [String],

  location: String,

  /* ✅ ADD THIS */
  latitude: Number,
  longitude: Number,

  likes: {
    type: Number,
    default: 0
  },

  celebrates: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

export default mongoose.model("Report", reportSchema);

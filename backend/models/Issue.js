import mongoose from "mongoose";

const issueSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,

    status: {
      type: String,
      enum: ["New", "In Progress", "Resolved", "Closed"],
      default: "New"
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Emergency"],
      default: "Medium"
    },

    crew: {
      type: String,
      default: ""
    },

    location: {
      lat: Number,
      lng: Number,
      address: String
    },

    activityLog: [
      {
        message: String,
        createdAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("Issue", issueSchema);

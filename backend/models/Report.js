import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    reportId: {
      type: String,
      unique: true
    },

    title: {
      type: String,
      required: true
    },

    category: {
      type: String,
      required: true
    },

    location: {
      type: String,
      required: true
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "low"
    },

    status: {
      type: String,
      enum: ["new", "in-progress", "resolved"],
      default: "new"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Report", reportSchema);

import mongoose from "mongoose";

const communitySchema = new mongoose.Schema(
  {
    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Report"
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    userName: {
      type: String,
      default: "Citizen"
    },

    title: {
      type: String,
      required: true
    },

    description: {
      type: String,
      default: ""
    },

    category: String,

    location: {
      type: String,
      default: "Local Area"
    },

    beforeImage: String,
    afterImage: String,

    likes: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }   // 🔥 THIS FIXES createdAt ERROR
);

export default mongoose.model("Community", communitySchema);

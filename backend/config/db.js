import mongoose from "mongoose";

/* ======================
   LIVE AUTO REFRESH CONFIG
====================== */
const REFRESH_INTERVAL = 30000; // 30 seconds (frontend fallback)
let refreshTimer = null;

/* ======================
   CONNECT DATABASE
====================== */
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log(" MongoDB Connected");

    /* ======================
       ENABLE CHANGE STREAMS
       (For live notifications)
    ====================== */
    enableChangeStreams();

  } catch (err) {
    console.error(" MongoDB Error:", err.message);
    process.exit(1);
  }
};

/* ======================
   CHANGE STREAM LISTENER
====================== */
const enableChangeStreams = () => {
  try {
    const connection = mongoose.connection;

    // MongoDB must be replica set (Atlas is OK)
    const reportCollection = connection.collection("reports");

    const changeStream = reportCollection.watch();

    changeStream.on("change", change => {

      if (change.operationType === "insert") {
        const newReport = change.fullDocument;

        console.log(" New Report Detected:", {
          id: newReport._id,
          title: newReport.title,
          department: newReport.department,
          priority: newReport.priority
        });

        /*
           FUTURE USE:
          - socket.io emit
          - SSE event
          - push notification
          
          Example:
          io.emit("new-report", newReport);
        */
      }
    });

    console.log(" MongoDB Change Streams Enabled");

  } catch (err) {
    console.warn(
      " Change Streams not enabled (requires replica set)",
      err.message
    );
  }
};

export default connectDB;

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({ 
  origin: ["http://localhost:3000", "https://leave-management-6da00.web.app"],
  methods: ["POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
});

// Initialize Firebase Admin with service account
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: "leave-management-6da00"
});

exports.sendNotification = functions.https.onRequest((req, res) => {
  // Enable CORS
  return cors(req, res, async () => {
    // Handle preflight requests
    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    // Only allow POST requests
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    try {
      const { token, title, body, icon, link } = req.body;

      // Validate required fields
      if (!token || !title || !body) {
        res.status(400).json({ error: "Missing required fields" });
        return;
      }

      const message = {
        token: token,
        notification: {
          title: title,
          body: body,
        },
        webpush: {
          fcmOptions: {
            link: link || "https://leave-management-6da00.web.app"
          },
          notification: {
            icon: icon || "/ist-logo.png",
            badge: icon || "/ist-logo.png",
            vibrate: [200, 100, 200]
          }
        }
      };

      // Send the message
      const response = await admin.messaging().send(message);
      
      // Send success response
      res.status(200).json({ 
        success: true, 
        messageId: response,
        data: {
          title,
          body,
          icon,
          link
        }
      });
    } catch (error) {
      console.error("Error sending notification:", error);
      res.status(500).json({ 
        error: "Failed to send notification",
        details: error.message 
      });
    }
  });
}); 
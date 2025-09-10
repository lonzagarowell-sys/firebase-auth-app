// admin.js
import admin from "firebase-admin";

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.applicationDefault(), // Make sure you have GOOGLE_APPLICATION_CREDENTIALS set
});

const uid = "UpJ66uZVmwNy7R0Rq1AL8ix7ywJ3";

admin.auth().setCustomUserClaims(uid, { admin: true })
  .then(() => console.log("Admin privileges granted!"))
  .catch(console.error);
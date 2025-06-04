import firebaseAdmin, { ServiceAccount } from "firebase-admin";
import serviceAccount from "../../service-account.json";

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount as ServiceAccount),
});

export const firebaseMessaging = firebaseAdmin.messaging();

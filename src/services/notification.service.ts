import { Notification } from "../models/notification.model";
import { Validation } from "../utils/validation";
import { NotificationValidation } from "../validations/notification.validation";
import { firebaseMessaging } from "../firebase/firebase.admin";

export class NotificationService {
  static async send(request: Notification): Promise<string> {
    const validRequest = Validation.validate(NotificationValidation.SEND, request);
    const message = {
      notification: {
        title: validRequest.title,
        body: validRequest.body,
      },
      token: validRequest.token,
    };

    return await firebaseMessaging.send(message);
  }
}

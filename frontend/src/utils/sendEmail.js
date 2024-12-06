import emailjs from "emailjs-com";
import emailConfig from "./emailConfig";

export function sendEmail(formData) {
  return emailjs.send(
    emailConfig.EMAILJS_SERVICE_ID, 
    emailConfig.EMAILJS_TEMPLATE_ID,
    {
      from_name: formData.name,
      from_email: formData.email,
      phone_number: formData.phone,
      message: formData.message,
    },
    emailConfig.EMAILJS_PUBLIC_KEY
  );
}

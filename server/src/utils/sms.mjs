import dotenv from "dotenv";
dotenv.config();

// Email sender function
export const sendSMS = async (mobile, message) => {
  try {
    const response = await fetch(
      `https://app.notify.lk/api/v1/send?user_id=${process.env.NOTIFY_USER_ID}&api_key=${process.env.NOTIFY_API_KEY}&sender_id=NotifyDEMO&to=${mobile}&message=${message}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("SMS sent:", data);
    return { data };
  } catch (error) {
    console.error("SMS Error:", error);
    return { success: false, message: "Failed to send SMS", error };
  }
};

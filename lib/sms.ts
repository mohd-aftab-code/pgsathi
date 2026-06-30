export async function sendOTP(phone: string, otp: string): Promise<boolean> {
  try {
    const apiKey = process.env.FAST2SMS_API_KEY;
    
    if (!apiKey) {
      console.warn("FAST2SMS_API_KEY is not defined in environment variables");
      // For local development, if key is missing, just return true and log OTP
      console.log(`[LOCAL DEV] OTP for ${phone} is ${otp}`);
      return true;
    }

    const message = `Your PGSathi password reset OTP is ${otp}. It is valid for 10 minutes. Do not share this with anyone.`;
    
    const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
      method: "POST",
      headers: {
        "authorization": apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        route: "q", // Quick transactional route
        message: message,
        language: "english",
        flash: 0,
        numbers: phone,
      })
    });

    const data = await response.json();
    
    if (data.return === true) {
      return true;
    } else {
      console.error("Fast2SMS API Error:", data);
      return false;
    }
  } catch (error) {
    console.error("Failed to send OTP:", error);
    return false;
  }
}

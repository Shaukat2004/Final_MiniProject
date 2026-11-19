import axios from 'axios';
import crypto from 'crypto';

// In-memory OTP storage for validation with expiry
const otpStore = new Map();
const requestStore = new Map();

export const minimothService = {
  /**
   * Dispatches OTP via Minimoth Gateway
   * @param {string} recipient - Phone number (e.g. +91 98201 44512) or Email
   * @param {string} channel - 'sms' | 'email'
   */
  async sendOtp(recipient, channel = 'sms') {
    const cleanRecipient = recipient.replace(/\s+/g, '');
    
    const previousRequest = requestStore.get(cleanRecipient);
    if (previousRequest && Date.now() - previousRequest < 60 * 1000) {
      throw new Error('Please wait one minute before requesting another OTP.');
    }
    requestStore.set(cleanRecipient, Date.now());
    const generatedOtp = crypto.randomInt(100000, 1000000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

    // Store in memory
    otpStore.set(cleanRecipient, {
      code: generatedOtp,
      expiresAt,
      attempts: 0
    });

    const apiKey = process.env.MINIMOTH_API_KEY;
    const apiUrl = process.env.MINIMOTH_API_URL;
    const senderId = process.env.MINIMOTH_SENDER_ID;
    const templateId = process.env.MINIMOTH_TEMPLATE_ID;
    if (!apiKey || !apiUrl || !senderId || !templateId) {
      throw new Error('Minimoth is not configured. Set MINIMOTH_API_KEY, MINIMOTH_API_URL, MINIMOTH_SENDER_ID and MINIMOTH_TEMPLATE_ID.');
    }

    const messagePayload = {
      apiKey: apiKey,
      sender: senderId,
      templateId: templateId,
      recipient: cleanRecipient,
      channel: channel,
      message: `Your OncoLink clinical login OTP is: ${generatedOtp}. Valid for 10 minutes. Please do not share this code.`,
      otp: generatedOtp
    };

    console.log(`[Minimoth Gateway] Attempting SMS dispatch to ${cleanRecipient}...`);

    try {
      const response = await axios.post(apiUrl, messagePayload, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 4000
      });

      console.log(`[Minimoth Gateway] External API response:`, response.data);
      return {
        success: true,
        gateway: 'Minimoth Live Gateway',
        recipient: cleanRecipient,
        messageId: response.data?.messageId || `MM-${Date.now()}`,
        expiresIn: '10 minutes'
      };
    } catch (error) {
      console.warn(`[Minimoth Gateway] Live gateway unreachable (${error.message}). Operating in Minimoth Sandbox Mode.`);
      otpStore.delete(cleanRecipient);
      throw new Error('OTP provider unavailable. Please try again shortly.');
    }
  },

  /**
   * Verifies OTP for a given recipient
   * @param {string} recipient
   * @param {string} code
   */
  verifyOtp(recipient, code) {
    const cleanRecipient = recipient.replace(/\s+/g, '');
    const entry = otpStore.get(cleanRecipient);

    if (!entry) {
      return { valid: false, message: 'No OTP requested for this contact or it has expired.' };
    }

    if (Date.now() > entry.expiresAt) {
      otpStore.delete(cleanRecipient);
      return { valid: false, message: 'OTP has expired. Please request a new code.' };
    }

    if (entry.attempts >= 5) {
      otpStore.delete(cleanRecipient);
      return { valid: false, message: 'Too many incorrect attempts. Please request a new OTP.' };
    }

    if (entry.code !== code.trim()) {
      entry.attempts += 1;
      return { valid: false, message: `Incorrect OTP. ${5 - entry.attempts} attempt(s) remaining.` };
    }

    // Success: cleanup
    otpStore.delete(cleanRecipient);
    return { valid: true, message: 'OTP verified successfully.' };
  }
};

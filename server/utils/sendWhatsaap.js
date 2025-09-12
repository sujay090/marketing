import axios from 'axios';
import dotenv from 'dotenv';
import { sendViaMsgWAPIAlternative, sendViaSimpleHTTP } from './whatsappAlternatives.js';
dotenv.config();

export default async function sendWhatsApp(to, imageUrl, customMessage = null) {
  try {
    // Validate inputs
    if (!to) throw new Error('Phone number is required');
    if (!imageUrl) throw new Error('Image URL is required');

    // Clean phone number format
    let number = to.toString().replace(/\D/g, ''); // Remove non-digits
    
    // Validate phone number
    if (number.length < 10) {
      throw new Error('Invalid phone number format');
    }
    
    // Add country code if not present
    if (!number.startsWith('91') && number.length === 10) {
      number = `91${number}`;
    }
    
    const message = customMessage || 'Your marketing poster is ready! 🎨✨';
    const token = process.env.MSGWAPI_TOKEN || process.env.WHATSAPP_API_TOKEN;

    if (!token) {
      throw new Error('WhatsApp API token not configured');
    }

    // Validate image URL
    if (!imageUrl.startsWith('http')) {
      throw new Error('Invalid image URL format');
    }

    console.log('📤 Initiating WhatsApp message send');
    console.log('📱 Phone:', `***${number.slice(-4)}`);
    console.log('🖼️ Image URL:', imageUrl);

    // Primary API attempt
    const apiConfig = {
      url: 'https://www.msgwapi.com/api/whatsapp/send',
      data: {
        receiver: number,
        msgtext: message,
        token: token,
        mediaurl: imageUrl
      },
      timeout: 30000
    };

    try {
      console.log('� Attempting primary WhatsApp API...');
      const response = await axios.post(apiConfig.url, apiConfig.data, {
        timeout: apiConfig.timeout,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'MarketingApp/1.0',
          'Accept': 'application/json'
        }
      });

      // Check response
      if (response.data) {
        console.log('✅ WhatsApp API response:', response.data);
        
        // Different APIs may have different success indicators
        const isSuccess = response.data.success !== false && 
                         response.status >= 200 && 
                         response.status < 300;

        if (isSuccess) {
          return {
            success: true,
            data: response.data,
            message: 'WhatsApp message sent successfully',
            timestamp: new Date().toISOString()
          };
        } else {
          throw new Error(response.data.message || 'API returned failure');
        }
      } else {
        throw new Error('Empty response from API');
      }

    } catch (primaryError) {
      console.log('⚠️ Primary API failed:', primaryError.message);
      
      // Try alternative methods
      try {
        console.log('🔄 Attempting alternative WhatsApp service...');
        const alternativeResult = await sendViaMsgWAPIAlternative(number, message, imageUrl);
        
        if (alternativeResult.success) {
          return alternativeResult;
        } else {
          throw new Error('Alternative service also failed');
        }
        
      } catch (alternativeError) {
        console.log('⚠️ Alternative API failed:', alternativeError.message);
        
        // Last attempt with simple HTTP
        try {
          console.log('🔄 Final attempt with simple HTTP...');
          const simpleResult = await sendViaSimpleHTTP(number, message, imageUrl);
          return simpleResult;
          
        } catch (finalError) {
          console.error('❌ All WhatsApp services failed');
          
          // Return detailed error information
          throw new Error(`WhatsApp delivery failed: ${primaryError.message}. Alternatives also failed.`);
        }
      }
    }

  } catch (error) {
    console.error('❌ WhatsApp send error:', {
      message: error.message,
      phone: to ? `***${to.toString().slice(-4)}` : 'N/A',
      imageUrl: imageUrl || 'N/A',
      timestamp: new Date().toISOString()
    });
    
    // Return structured error
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
      details: {
        phone: to,
        hasToken: !!process.env.MSGWAPI_TOKEN,
        hasImageUrl: !!imageUrl
      }
    };
  }
}

// Utility function to validate WhatsApp number
export const validateWhatsAppNumber = (number) => {
  if (!number) return false;
  
  const cleaned = number.toString().replace(/\D/g, '');
  
  // Must be at least 10 digits
  if (cleaned.length < 10) return false;
  
  // If 10 digits, assume Indian number
  if (cleaned.length === 10) return true;
  
  // If starts with 91 and has 12 digits total, it's valid
  if (cleaned.startsWith('91') && cleaned.length === 12) return true;
  
  // Other international formats (basic validation)
  if (cleaned.length >= 10 && cleaned.length <= 15) return true;
  
  return false;
};

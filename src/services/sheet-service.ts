import { ContactFormInput } from '../types'
import { GOOGLE_SCRIPT_API_URL } from '../constants'

/**
 * GOOGLE APPS SCRIPT DEPLOYMENT GUIDE:
 * 
 * 1. Create a Google Sheet, name it "Crimson Contacts".
 * 2. Create column headers in Row 1: Timestamp, Name, Phone, Email, Message
 * 3. Go to Extensions -> Apps Script.
 * 4. Replace the default code with:
 * 
 * ```javascript
 * function doPost(e) {
 *   var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
 *   try {
 *     var data = JSON.parse(e.postData.contents);
 *     
 *     sheet.appendRow([
 *       new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }),
 *       data.name,
 *       data.phone,
 *       data.email,
 *       data.message
 *     ]);
 *     
 *     return ContentService.createTextOutput(JSON.stringify({ success: true }))
 *       .setMimeType(ContentService.MimeType.JSON)
 *       .setHeader("Access-Control-Allow-Origin", "*");
 *   } catch (error) {
 *     return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
 *       .setMimeType(ContentService.MimeType.JSON)
 *       .setHeader("Access-Control-Allow-Origin", "*");
 *   }
 * }
 * 
 * function doOptions(e) {
 *   return ContentService.createTextOutput("")
 *     .setHeader("Access-Control-Allow-Origin", "*")
 *     .setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
 *     .setHeader("Access-Control-Allow-Headers", "Content-Type");
 * }
 * ```
 * 
 * 5. Click "Deploy" -> "New Deployment".
 * 6. Select "Web App". Set "Execute as" to "Me", and "Who has access" to "Anyone".
 * 7. Copy the Web App URL and add it to your project as `VITE_GOOGLE_SCRIPT_URL` in `.env.local` or `.env.production`.
 */

export async function submitContactForm(data: ContactFormInput): Promise<{ success: boolean; message?: string }> {
  // If API URL is not set, we will mock save to local storage with a 1s delay and return success.
  if (!GOOGLE_SCRIPT_API_URL) {
    console.warn('VITE_GOOGLE_SCRIPT_URL is not set. Simulating data submission (saving to LocalStorage)...')
    await new Promise((resolve) => setTimeout(resolve, 1200))
    
    // Save to local storage mock database
    const submissions = JSON.parse(localStorage.getItem('crimson_submissions') || '[]')
    submissions.push({
      timestamp: new Date().toLocaleString(),
      ...data,
    })
    localStorage.setItem('crimson_submissions', JSON.stringify(submissions))
    
    return { success: true }
  }

  try {
    const response = await fetch(GOOGLE_SCRIPT_API_URL, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    if (result.success) {
      return { success: true }
    } else {
      return { success: false, message: result.error || 'Submission failed on server' }
    }
  } catch (error: any) {
    console.error('Error submitting contact form:', error)
    return {
      success: false,
      message: error.message || 'Network error occurred while sending message',
    }
  }
}

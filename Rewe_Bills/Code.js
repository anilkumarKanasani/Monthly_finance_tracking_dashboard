const SCRIPT_PROPERTIES = {
  TELEGRAM_TOKEN: 'TelegramToken',
  CHAT_ID: 'ChatID',
};

const DRIVE_FOLDER_NAME = "Rewe_Bills";
const EMAIL_SUBJECT_FILTER = "REWE eBon";
const EXCEL_NAME = "Rewe_Bills_Overview";

/**
 * Gets the current date formatted as YYYY_MM_DD.
 * @returns {string} The formatted date string.
 */
function getCurrentDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}_${month}_${day}`;
}

/**
 * Sends a message to a Telegram chat.
 * @param {string} message The text message to send.
 */
function sendTelegramMessage(message) {
  const scriptProperties = PropertiesService.getScriptProperties();
  const token = scriptProperties.getProperty(SCRIPT_PROPERTIES.TELEGRAM_TOKEN);
  const chatId = scriptProperties.getProperty(SCRIPT_PROPERTIES.CHAT_ID);

  if (!token || !chatId) {
    Logger.log('Telegram token or chat ID is not set in script properties.');
    return;
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const payload = {
    chat_id: chatId,
    text: message,
  };
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
  };

  UrlFetchApp.fetch(url, options);
}


function extractInfoByGemini(text) {
  try {
    Logger.log('Extracting info using Gemini API.');

    // The prompt is your instruction to the model.
    // You can customize it to extract exactly what you need.
    const prompt = `From the following receipt text, extract the total amount, the date of purchase, and the store name. Return the result as a JSON object with keys  "date", "Store name", "bill amount", "old balance", and "new balance". For example store name can be Rewe, bill amount can be found immediately after SUMME EUR, old balance can be found in ( ) after Geschenkkarte. New balance is after the the brackets. \n\nReceipt Text:\n${text}`;

    const apiKey = PropertiesService.getScriptProperties().getProperty('GeminiApiKey');
    if (!apiKey) {
      Logger.log('Gemini API key is not set in script properties.');
      return null;
    }

    // This is the endpoint for the Gemini 1.0 Pro model.
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const payload = {
      "contents": [{
        "parts": [{
          "text": prompt
        }]
      }]
    };

    const options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
    };

    const response = UrlFetchApp.fetch(url, options);
    const result = JSON.parse(response.getContentText());

    Logger.log('Info extracted successfully from Gemini API.');
    // The response from Gemini is inside a nested structure.
    // We'll extract the text and parse it if it's a JSON string.
    const extractedText = result.candidates[0].content.parts[0].text;
    // The model might return the JSON inside a markdown code block, so we clean it.
    return JSON.parse(extractedText.replace(/```json\n|```/g, ''));
  } catch (e) {
    Logger.log(`Error during Gemini API extraction: ${e.message}`);
    return null;
  }
}

/**
 * Extracts visible text from an attachment using Google Drive's built-in OCR.
 * This works for PDFs and image files.
 * @param {GmailAttachment} attachment The email attachment to process.
 * @returns {string} The extracted text from the attachment.
 */
function extractTextFromAttachment(attachment) {
  try {
    Logger.log(`Extracting text from attachment: ${attachment.getName()}`);

    // v3 API resource: Use 'name' instead of 'title'.
    // The mimeType of the created Google Doc will be inferred.
    const resource = {
      name: attachment.getName(),
      mimeType: 'application/vnd.google-apps.document' // Explicitly request a Google Doc for OCR
    };

    // v3 API optional arguments for OCR.
    const options = {
      ocr: true,
      fields: 'id'
    };

    // Use Drive.Files.create for v3. It takes the same arguments but has a different name.
    const docFile = Drive.Files.create(resource, attachment.copyBlob(), options);
    const doc = DocumentApp.openById(docFile.id);
    const text = doc.getBody().getText();

    // Clean up: remove the temporary Google Doc
    Drive.Files.remove(docFile.id);

    Logger.log(`Extracted text successfully.`);
    return text;
  } catch (e) {
    Logger.log(`Error during OCR extraction: ${e.message}`);
    return null; // Return null or an empty string on failure
  }
}

/**
 * Processes REWE emails, stars them, and saves attachments to Google Drive.
 * @returns {{newEmailCount: number, oldEmailCount: number, savedAttachmentCount: number}} An object with counts of processed emails and attachments.
 */
function processMails() {
  const currentDate = getCurrentDate();
  const threads = GmailApp.getInboxThreads();
  let newEmailCount = 0;
  let oldEmailCount = 0;
  let savedAttachmentCount = 0;

  const folders = DriveApp.getFoldersByName(DRIVE_FOLDER_NAME);
  const billsFolder = folders.hasNext() ? folders.next() : DriveApp.createFolder(DRIVE_FOLDER_NAME);

  for (const thread of threads) {
    const firstMessage = thread.getMessages()[0];
    const subject = firstMessage.getSubject();
    if (subject.includes(EMAIL_SUBJECT_FILTER)) {
      if (firstMessage.isStarred()) {
        oldEmailCount++;
      } else {
        firstMessage.star();
        newEmailCount++;
        const attachments = firstMessage.getAttachments();
        for (const [index, attachment] of attachments.entries()) {
          const originalName = attachment.getName();
          const newFileName = `${currentDate}_${index + 1}_${originalName}`;
          billsFolder.createFile(attachment.copyBlob().setName(newFileName));
          savedAttachmentCount++;
          const extractedText = extractTextFromAttachment(attachment);
          if (extractedText) {
            const extractedInfo = extractInfoByGemini(extractedText);
            Logger.log(`Extracted Info: ${JSON.stringify(extractedInfo)}`);
          }
        }
      }
    }
  }
  return {
    newEmailCount,
    oldEmailCount,
    savedAttachmentCount,
  };
}

/**
 * Writes sample data to a Google Sheet.
 * @param {Array<Array>} newData The new data to write to the sheet.
 */
function writeDataToSheet(newData) {
  try {
    const excelFile = DriveApp.getFilesByName(EXCEL_NAME);
    if (!excelFile.hasNext()) {
      Logger.log(`Excel file "${EXCEL_NAME}" not found in Drive.`);
      return;
    }

    const file = excelFile.next();
    const spreadsheet = SpreadsheetApp.openById(file.getId());
    let sheet = spreadsheet.getSheets()[0];

    if (!sheet) {
      Logger.log(`No sheets found in the excel "${EXCEL_NAME}".`);
    }

    // Append new data to existing data
    const existingData = sheet.getDataRange().getValues();
    const AllData = existingData.concat(newData);
    sheet.clearContents();
    sheet.getRange(1, 1, AllData.length, AllData[0].length).setValues(AllData); // This might fail if AllData is empty

    Logger.log(`Successfully wrote ${newData.length} rows".`);
  } catch (e) {
    Logger.log(`Error in writeDataToSheet: ${e.message}`);
  }
}


/**
 * Main function to be scheduled daily.
 * It processes emails and sends a summary report to Telegram.
 */
function dailyReweSchedule() {
  const currentDate = getCurrentDate();
  Logger.log(`Processing for: ${currentDate}`);

  const {
    newEmailCount,
    oldEmailCount,
    savedAttachmentCount
  } = processMails();

  const teleMessage = `${currentDate}: new: ${newEmailCount} old: ${oldEmailCount} saved: ${savedAttachmentCount}`;
  sendTelegramMessage(teleMessage);

  // Example data for testing writeDataToSheet
  const newData = [
    ['2024-06-01', 'Trail4', 45.67, 100.00, 54.33],
    ['2024-06-02', 'Trail4', 23.45, 54.33, 30.88],
    ['2024-06-03', 'Trail4', 67.89, 30.88, -36.01],
  ];

  writeDataToSheet(newData);
  Logger.log(`Completed: ${teleMessage}`);
}

// It's recommended to run this function via a time-driven trigger
// rather than calling it in the global scope.
// To test, you can run `dailyReweSchedule` directly from the Apps Script editor.
dailyReweSchedule();

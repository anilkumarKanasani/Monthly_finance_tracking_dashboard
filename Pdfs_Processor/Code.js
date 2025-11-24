const SCRIPT_PROPERTIES = {
  TELEGRAM_TOKEN: "TelegramToken",
  CHAT_ID: "ChatID",
};

const DRIVE_FOLDER_NAME = "Rewe_Bills";
const MANUAL_BILLS_DRIVE_FOLDER_NAME = "Manual_bills";
const EMAIL_SUBJECT_FILTER = "REWE eBon"; // Using a constant for this is a good practice
const REWE_BILLS_EXCEL_NAME = "Rewe_Bills_Overview";


const PAYSLIPS_DRIVE_FOLDER_NAME = "2026";
const PAYSLIPS_EXCEL_NAME = "2026_at_a_glance";


function get_rewe_bills_prompt(text){
return  `From the following receipt text, extract the information and return it as a JSON object.

                The JSON object must have these keys: "date", "Store name", "bill amount", "old balance", and "new balance".

                - "Store name" can be something like Rewe, Netto, Kaufland, Lidil, SSB, DB or something similar.
                - "bill amount" is found after "SUMME EUR" or something in bigger fonts.
                - "old balance" is the value in parentheses "()" after "Geschenkkarte".
                - "new balance" is the value immediately after the parentheses for the old balance.
                - If "old balance" or "new balance" are not present, use "0.00" for their values.

                Receipt Text:
                ${text}`;
}

function get_payslips_prompt(text){
return  `From the following Payslips text, extract the information and return it as a JSON object.

                The JSON object must have these keys: "date", "Description", "Income", "Expenses", "Category".

                - "Date" can be the end date of the payslips month. For example, if payslip is "für Oktober 2025" date will be "31-10-2025".
                - "Description" can be if 
                    - "Gehalt" then "Base Salary", 
                    - "Betriebl.AV,AG,lfd,§3Nr.63EStG" then "Pesnion Income",
                    - "Sachbezug/Goodies" then "Goodies"
                    - "Essenszuschuss" or "Fahrtkosten" then "Become 1"
                    - "Steuerrechtliche Abzüge" then "Income Tax"
                    - "KV-Beitrag" then "Health Insurance"
                    - "RV-Beitrag" then "Pension"
                    - "AV-Beitrag" then "Employe Insurance"
                    - "PV-Beitrag" then "Nursing Care"
                    - "Gehaltsverzicht bAV" then "Alliance_Pension"
                - "Income" is found in corresponding Betrag column.
                    - "Income" should be only for "Base Salary", "Pension Income", "Goodies", "Become 1"
                    - For remaining "Income is 0.00"
                - "Expenses" is foung just below the Description
                    - "Expenses" should be only for "Income Tax", "Health Insurance", "Pension", "Employe Insurance", "Nursing Care", "Alliance_Pension"
                    - For remaining "Expenses is 0.00"
                - "Category" should be one of the ["Base_Income", "Alliance_Pension", "Extra_Income", "Tax", "Insurance",  "State_Pension", "Employe_Insurance", "Care_insurance"]
                    - "Base Salary" then "Base_Income"
                    - "Pesnion Income" or "Alliance_Pension" then "Alliance_Pension"
                    - "Goodies" then "Extra_Income"
                    - "Become 1" then "Extra_Income"
                    - "Income Tax" then "Tax"
                    - "Health Insurance" then "Insurance"
                    - "Pension" then "State_Pension"
                    - "Employe Insurance" then "Employe_Insurance"
                    - "Nursing Care" then "Care_insurance"
                Payslip Text:
                ${text}`;
}
/**
 * Gets the current date formatted as YYYY_MM_DD.
 * @returns {string} The formatted date string.
 */
function getCurrentDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
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
    Logger.log("Telegram token or chat ID is not set in script properties.");
    return;
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const payload = {
    chat_id: chatId,
    text: message,
  };
  const options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
  };

  UrlFetchApp.fetch(url, options);
}

function extractInfoByGemini(text, prompt_template = "") {
  try {
    Logger.log("Extracting info using Gemini API.");
    
    if (prompt_template == "get_rewe_bills_prompt"){
      prompt = get_rewe_bills_prompt(text);
    }
    else if (prompt_template == "get_payslips_prompt"){
      prompt = get_payslips_prompt(text);
    }

    const apiKey =
      PropertiesService.getScriptProperties().getProperty("GeminiApiKey");
    if (!apiKey) {
      Logger.log("Gemini API key is not set in script properties.");
      return null;
    }

    // This is the endpoint for the Gemini 1.0 Pro model.
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const payload = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
    };

    const options = {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload),
    };

    const response = UrlFetchApp.fetch(url, options);
    const result = JSON.parse(response.getContentText());

    Logger.log("Info extracted successfully from Gemini API.");
    // The response from Gemini is inside a nested structure.
    // We'll extract the text and parse it if it's a JSON string.
    const extractedText = result.candidates[0].content.parts[0].text;
    // The model might return the JSON inside a markdown code block, so we clean it.
    const jsonInfo = JSON.parse(extractedText.replace(/```json\n|```/g, ""));
    if (prompt_template == "get_rewe_bills_prompt"){
      const listInfo = [[
            jsonInfo["date"],
            jsonInfo["Store name"],
            parseFloat(jsonInfo["bill amount"]),
            parseFloat(jsonInfo["old balance"]),
            parseFloat(jsonInfo["new balance"]),
            "Not Yet"
          ]];
      return listInfo;
        }
    else if (prompt_template == "get_payslips_prompt"){
      const listInfo = jsonInfo.map(item => [
        item.date,
        item.Description,
        parseFloat(item.Income),
        parseFloat(item.Expenses),
        item.Category
      ]);
      return listInfo;
    }
    else {
    return null;
    }
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
      mimeType: "application/vnd.google-apps.document", // Explicitly request a Google Doc for OCR
    };

    // v3 API optional arguments for OCR.
    const options = {
      ocr: true,
      fields: "id",
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
 * Writes sample data to a Google Sheet.
 * @param {Array<Array>} newData The new data to write to the sheet.
 */
function AppendDataToSheet(newData, EXCEL_NAME = "") {
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
      Logger.log(`No sheets found in the spreadsheet "${EXCEL_NAME}".`);
    }

    // Append new data to existing data
    const existingData = sheet.getDataRange().getValues();
    const AllData = existingData.concat(newData);
    sheet.clearContents(); // This is inefficient for large sheets. Consider appending.
    sheet.getRange(1, 1, AllData.length, AllData[0].length).setValues(AllData); // This might fail if AllData is empty

    Logger.log(`Successfully wrote ${newData.length} rows".`);
  } catch (e) {
    Logger.log(`Error in AppendDataToSheet: ${e.message}`);
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
  const billsFolder = folders.hasNext()
    ? folders.next()
    : DriveApp.createFolder(DRIVE_FOLDER_NAME);

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
            const listInfo = extractInfoByGemini(extractedText, "get_rewe_bills_prompt");
            AppendDataToSheet(listInfo, REWE_BILLS_EXCEL_NAME);
            Logger.log(`Extracted Info: ${listInfo}`);
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

function processDocsInAFolder(DRIVE_FOLDER_NAME) {
  let oldFileCount = 0;
  let staredFileCount = 0;
  const folders = DriveApp.getFoldersByName(DRIVE_FOLDER_NAME);
  const billsFolder = folders.hasNext()
    ? folders.next()
    : DriveApp.createFolder(DRIVE_FOLDER_NAME);
  
  // Read all the fpdf iles in the billsFOlder location
  const files = billsFolder.getFilesByType("application/pdf");
  // The 'for...of' loop requires an iterator, but getFilesByType returns a FileIterator.
  // We need to use a 'while' loop with hasNext() and next().
  while (files.hasNext()) {
    const file = files.next();
    if (file.isStarred()) {
      oldFileCount++;
    } else {
      file.setStarred(true);
      staredFileCount++;
      // The 'extractTextFromAttachment' function expects a GmailAttachment, but here we have a Drive File.
      // We need to get its blob to pass it.
      const extractedText = extractTextFromAttachment(file.getBlob());
      if (extractedText) {
        if (DRIVE_FOLDER_NAME == MANUAL_BILLS_DRIVE_FOLDER_NAME){
          prompt = "get_rewe_bills_prompt"
          excel_name = REWE_BILLS_EXCEL_NAME
        }
        else if (DRIVE_FOLDER_NAME == PAYSLIPS_DRIVE_FOLDER_NAME){

          prompt = "get_payslips_prompt"
          excel_name = PAYSLIPS_EXCEL_NAME
        }
        
        const listInfo = extractInfoByGemini(extractedText, prompt);
        AppendDataToSheet(listInfo, excel_name );
        Logger.log(`Extracted Info: ${listInfo}`);
        }

      }
    }
  return { staredFileCount, oldFileCount };
}


/**
 * Main function to be scheduled daily.
 * It processes emails and sends a summary report to Telegram.
 */
function dailyReweSchedule() {
  const currentDate = getCurrentDate();
  Logger.log(`Email bills Processing for: ${currentDate}`);

  const { newEmailCount, oldEmailCount, savedAttachmentCount } =
    processMails();

  const teleMessage = `Email bills Processing report for:${currentDate}: New Emails Count : ${newEmailCount} Already in Emails Count: ${oldEmailCount} Uploaded Files Count : ${savedAttachmentCount}`;
  sendTelegramMessage(teleMessage);
  Logger.log(`Completed: ${teleMessage}`);
}

/**
 * Main function to be scheduled daily.
 * It processes manual bills and sends a summary report to Telegram.
 */
function dailyManualBillsSchedule() {
  const currentDate = getCurrentDate();
  Logger.log(`Manual Bills Processing for: ${currentDate}`);
  const { staredFileCount, oldFileCount } = processDocsInAFolder(MANUAL_BILLS_DRIVE_FOLDER_NAME);
  const teleMessage = `Manual Bills Processing report for:${currentDate}: \n
                        Uploaded Files Count : ${staredFileCount} \n
                        Already in Drive Count: ${oldFileCount}`;
  sendTelegramMessage(teleMessage);
  Logger.log(`Completed: ${teleMessage}`);
}


/**
 * Main function to be scheduled monthly.
 * It processes payslips and sends a summary report to Telegram.
 */
function monthlyPayslipsSchedule() {
  const currentDate = getCurrentDate();
  Logger.log(`Payslips Processing for: ${currentDate}`);
  const { staredFileCount, oldFileCount } = processDocsInAFolder(PAYSLIPS_DRIVE_FOLDER_NAME);
  const teleMessage = `Monthly Payslips Processing report for:${currentDate}: \n
                       Uploaded Files Count : ${staredFileCount} \n
                       Already in Drive Count: ${oldFileCount}`;
  sendTelegramMessage(teleMessage);
  Logger.log(`Completed: ${teleMessage}`);
}


/**
 * Function to trigger Daily
 */
function dailyTrigger(){
  dailyReweSchedule();
  dailyManualBillsSchedule();
}


/**
 * Function to trigger Monthly
 */
function monthlyTrigger(){
  monthlyPayslipsSchedule();
}
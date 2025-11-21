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
          const newFileName = `${currentDate}_${originalName}_${index + 1}`;
          billsFolder.createFile(attachment.copyBlob().setName(newFileName));
          savedAttachmentCount++;
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
  // const currentDate = getCurrentDate();
  // Logger.log(`Processing for: ${currentDate}`);

  // const {
  //   newEmailCount,
  //   oldEmailCount,
  //   savedAttachmentCount
  // } = processMails();

  // const teleMessage = `${currentDate}: new: ${newEmailCount} old: ${oldEmailCount} saved: ${savedAttachmentCount}`;
  // sendTelegramMessage(teleMessage);

  // Example data for testing writeDataToSheet
  const newData = [
    ['2024-06-01', 'Trail3', 45.67, 100.00, 54.33],
    ['2024-06-02', 'Trail3', 23.45, 54.33, 30.88],
    ['2024-06-03', 'Trail3', 67.89, 30.88, -36.01],
  ];

  writeDataToSheet(newData);
  // Logger.log(`Completed: ${teleMessage}`);
}

// It's recommended to run this function via a time-driven trigger
// rather than calling it in the global scope.
// To test, you can run `dailyReweSchedule` directly from the Apps Script editor.
dailyReweSchedule();

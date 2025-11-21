const SCRIPT_PROPERTIES = {
  TELEGRAM_TOKEN: 'TelegramToken',
  CHAT_ID: 'ChatID',
};

const DRIVE_FOLDER_NAME = "Rewe_Bills";
const EMAIL_SUBJECT_FILTER = "REWE eBon";
const SPREADSHEET_NAME = "Rewe_Bills_Overview";

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
 * It creates a sheet named 'SampleOutput' if it doesn't exist
 * and writes a sample dataset to it.
 */
function writeDataToSheet() {
  try {
    const excelName = 'Rewe_bills_overview';
    const excelFile = DriveApp.getFilesByName(excelName);
    if (!excelFile.hasNext()) {
      Logger.log(`Excel file "${excelName}" not found in Drive.`);
      return;
    }
    const file = excelFile.next();
    const spreadsheet = SpreadsheetApp.openById(file.getId());
    let sheet = spreadsheet.getSheets()[0];

    if (!sheet) {
      sheet = spreadsheet.insertSheet(sheetName);
      Logger.log(`Sheet "${sheetName}" was created.`);
    }

    const sampleData = [
      ['Date', 'Description', 'Bill amount', 'Old Balance', 'New Balance'],
      ['2024-06-01', 'REWE Einkauf', 45.67, 100.00, 54.33],
      ['2024-06-02', 'REWE Einkauf', 23.45, 54.33, 30.88],
      ['2024-06-03', 'REWE Einkauf', 67.89, 30.88, -36.01],
    ];

    // Clear existing data and write new data
    sheet.clear();
    const range = sheet.getRange(1, 1, sampleData.length, sampleData[0].length);
    range.setValues(sampleData);

    Logger.log(`Successfully wrote ${sampleData.length} rows".`);
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

  writeDataToSheet();
  Logger.log(`Completed`);
  // Logger.log(`Completed: ${teleMessage}`);
}



// It's recommended to run this function via a time-driven trigger
// rather than calling it in the global scope.
// To test, you can run `dailyReweSchedule` directly from the Apps Script editor.
dailyReweSchedule();
# Monthly_finance_tracking_dashboard

This repository contains the code for a monthly finance tracking dashboard. The dashboard allows users to track their income, expenses, and net worth over time. It also provides visualizations of the data, such as charts and graphs.

This repository is still under development, but it is already a powerful tool for tracking your finances.

## Components

### Finance Dashboard

The core of this project is a dashboard written in Python using the Plotly library to create visualizations.

#### Features
*   Track income, expenses, and net worth in different currencies.
*   Visualizations of data, such as charts and graphs, to help users understand their financial trends.
*   Easy to use and customize. Users can add or remove accounts, categories, and visualizations.
*   Open source and available on GitHub.

### Rewe Bills Automation (`Rewe_Bills/`)

This component is a Google Apps Script that automates the process of collecting digital receipts from REWE supermarkets.

#### How it works
1.  **Scans Gmail:** The script runs on a daily schedule and searches for unread emails from REWE with the subject "REWE eBon".
2.  **Saves Attachments:** It finds PDF attachments (the receipts) in these emails.
3.  **Stores in Google Drive:** Each receipt is saved to a specific Google Drive folder named `Rewe_Bills`. The files are renamed with the current date for easy tracking.
4.  **Stars Emails:** The processed emails are starred in Gmail to avoid processing them again.
5.  **Sends Notification:** A summary of the daily run (how many new bills were saved) is sent to a Telegram chat.

#### Setup
1.  Create a new Google Apps Script project and copy the code from `Rewe_Bills/Code.js`.
2.  Set the following Script Properties:
    *   `TelegramToken`: Your Telegram Bot token.
    *   `ChatID`: The ID of the Telegram chat where you want to receive notifications.
3.  Set up a daily time-driven trigger to run the `dailyReweSchedule` function.

I hope you find this project useful!
# Enquiry setup

Every form on the website (dealer, distributor, bulk order, product and contact) can deliver an enquiry two ways. Set up either one, or both:

- Google Sheet: a Google Apps Script writes one row to a Sheet and emails a summary. This is the record. Parts 1 to 7 below.
- Telegram: a bot posts the enquiry to a chat or group, so it rings on the phone within a second, with a button that opens WhatsApp to the enquirer. Free, no approval needed. See "Telegram" at the end.

The website tells the visitor "We have your enquiry" only after at least one of the two confirmed it. If both are set up and one is down, the enquiry still arrives through the other. Until one of them is set up, every form shows "We could not send this from the website just now" and keeps the visitor's details in the form.

You need: a Google account that should own the enquiries (for the Sheet), a Telegram account (for Telegram), and access to the Vercel project.

## 1. Create the Sheet

1. Go to sheets.google.com and create a blank spreadsheet.
2. Name it "Virgo website enquiries".
3. Leave it empty. The script creates a tab called "Enquiries" with a header row on the first enquiry.

## 2. Paste the script

1. In the Sheet, open Extensions > Apps Script.
2. Delete everything in the `Code.gs` file.
3. Open `docs/enquiry-webhook.gs` from this repository, copy all of it and paste it into `Code.gs`.
4. Press the save icon.

## 3. Set the two Script Properties

1. Make a long random secret, for example by running `openssl rand -hex 32` in a terminal, or with a password manager. Keep it somewhere safe; you will paste it twice.
2. In Apps Script, click Project Settings (the gear icon on the left).
3. Under Script Properties, click Add script property and add:
   - Property `ENQUIRY_SECRET`, value: the secret from step 1.
   - Property `NOTIFY_EMAIL`, value: the email address that should get every enquiry.
4. Click Save script properties.

## 4. Deploy as a web app

1. Click Deploy > New deployment.
2. Click the gear next to Select type and choose Web app.
3. Description: "Website enquiries".
4. Execute as: Me.
5. Who has access: Anyone.
6. Click Deploy. Google asks you to authorise the script: choose your account, click Advanced, then "Go to (project name)", then Allow. It asks for access to the Sheet and to send email as you.
7. Copy the Web app URL. It ends in `/exec`.

"Anyone" means anyone with the URL can call it. The script rejects every call that does not carry the secret, so only the website can add rows.

## 5. Add the keys in Vercel

1. Open the project in Vercel, then Settings > Environment Variables.
2. Add `ENQUIRY_WEBHOOK_URL` with the Web app URL from step 4. Tick Production and Preview.
3. Add `ENQUIRY_WEBHOOK_SECRET` with the same secret you put in `ENQUIRY_SECRET`. Tick Production and Preview.
4. Save.

Never paste the secret into chat, email, a commit or a document. For local work, put the two keys in `.env.local` (see `.env.example`); that file is not committed.

## 6. Redeploy

Environment variables only apply to new deployments.

1. In Vercel, open Deployments.
2. On the latest Production deployment, open the menu (three dots) and choose Redeploy.
3. Do the same for the Preview deployment you want to test on, or push a new commit.

## 7. Send a test

1. Open the contact page on the deployed site.
2. Fill in the form with your own name and mobile number and the message "Test enquiry, please ignore".
3. Wait at least three seconds after the page opens before pressing Send enquiry. Forms sent faster are treated as bots.
4. You should see "We have your enquiry." with a reference like `VE-261122-ABCD`.
5. Check the Sheet: a new row on the "Enquiries" tab with that reference.
6. Check the inbox of `NOTIFY_EMAIL` for an email with the same reference.

If the site shows "We could not send this from the website just now":

- In Vercel, open the deployment's Logs and search for `[enquiry]`. The line names the channel (`sheet` or `telegram`) and says whether no channel is set up, it timed out, or it answered without `ok: true`.
- In Apps Script, open Executions to see if the call arrived and any error.
- Check that `ENQUIRY_SECRET` and `ENQUIRY_WEBHOOK_SECRET` are exactly the same, with no spaces.

## Changing the script later

After you edit the script, click Deploy > Manage deployments, click the pencil on the existing deployment, choose Version: New version and click Deploy. This keeps the same URL, so Vercel needs no change. Creating a new deployment instead gives a new URL, which you would then have to update in Vercel.

## Telegram

Do this from the Telegram account of the person who should get the enquiries. It takes about five minutes.

### 1. Make the bot

1. In Telegram, search for `@BotFather` (blue tick) and open it.
2. Send `/newbot`.
3. Name: `Virgo Enquiries`. Username: anything free that ends in `bot`, for example `virgo_enquiries_bot`.
4. BotFather replies with a token that looks like `1234567890:AA...`. This is a password. Do not post it anywhere except Vercel.

### 2. Decide who gets the enquiries

For one person: open the new bot in Telegram and press Start.

For several people (recommended, so the owner and the office both see every enquiry): create a group, for example "Virgo website enquiries", add the people, then add the bot to the group as a member.

### 3. Find the chat id

1. Send any message to the bot (or in the group).
2. In a browser, open `https://api.telegram.org/bot<token>/getUpdates`, with your token in place of `<token>`.
3. Find `"chat":{"id":` in the answer. A person's id is a number such as `123456789`; a group's id is negative, such as `-1001234567890`. Copy the number including the minus sign.

If the answer is empty, send another message and reload.

### 4. Add the keys in Vercel

1. Settings > Environment Variables.
2. Add `TELEGRAM_BOT_TOKEN` with the token. Tick Production and Preview. Mark it Sensitive.
3. Add `TELEGRAM_CHAT_ID` with the chat id. For more than one chat, separate the ids with commas.
4. Redeploy (part 6 above).

### 5. Send a test

Send the contact form as in part 7. Within a second the chat gets a message with the enquiry type, name, city, mobile number, the form's other answers, the reference, and a "Reply on WhatsApp" button.

If nothing arrives, the Vercel log line reads `telegram: no chat accepted the message`. The usual causes: the chat id is wrong or lost its minus sign, nobody pressed Start on the bot, or the bot was removed from the group.

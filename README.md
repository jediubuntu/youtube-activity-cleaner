# 📺 YouTube Activity Auto-Cleaner (Comments, Likes & Dislikes, Live Chat)

> **100% Free & Open-Source. Lightweight, zero-install browser automation to bulk delete your YouTube Comments, Video Likes & Dislikes, and Live Chat history directly from Google My Activity.**

---

## 📌 Why This Tool?
- **Multi-Activity Support**: Works seamlessly across multiple Google My Activity pages:
  - 💬 **Comments & Replies**: `https://myactivity.google.com/page?page=youtube_comments`
  - 👍 **Likes & Dislikes**: `https://myactivity.google.com/page?page=youtube_likes`
  - 🗨️ **Live Chat Messages**: `https://myactivity.google.com/page?page=youtube_live_chat`
- **Native Limitation Solved**: Google does **not** provide a *"Delete All"* button for YouTube comments or video likes/dislikes. You are forced to click **X** on each entry one by one. This tool automates the process completely.
- **Server-Sync Pacing & Verification**: Only advances after verifying each card is actually removed from the DOM, and paces requests so Google's backend transaction writes to disk (preventing deleted items from reappearing on refresh).
- **100% Free Forever**: No paid extensions, subscriptions, or login sharing.

---

## 🚀 How to Use (Step-by-Step)

### Step 1: Open Google My Activity in a Separate Browser Window
1. Open a **new browser window** (pull it out as its own window).
2. Go to your target activity page:
   - **For Comments**: [Google My Activity — YouTube Comments](https://myactivity.google.com/page?page=youtube_comments)
   - **For Likes & Dislikes**: [Google My Activity — YouTube Likes](https://myactivity.google.com/page?page=youtube_likes)
   - **For Live Chat**: [Google My Activity — YouTube Live Chat](https://myactivity.google.com/page?page=youtube_live_chat)
3. In the top-right corner, **verify your channel profile** (switch to your Brand Account or secondary channel if applicable).

### Step 2: Open Developer Console
1. Press **`F12`** (or **`Ctrl + Shift + J`** on Windows / **`Cmd + Option + J`** on Mac).
   - Alternatively, right-click anywhere on the page and click **Inspect**, then select the **Console** tab.
2. *(If your browser shows a safety warning about pasting, simply type `allow pasting` and press Enter).*

### Step 3: Copy & Run the Script
1. Open the [**Raw Script Link (Click Here)**](https://raw.githubusercontent.com/jediubuntu/youtube-activity-cleaner/main/youtube-activity-cleaner.js).
2. Select everything (**`Ctrl + A`** or **`Cmd + A`**) and copy it (**`Ctrl + C`** or **`Cmd + C`**).
3. Switch back to your Google My Activity window, paste it into the **Console**, and press **Enter**.
4. The script will automatically detect the page type, delete items sequentially with database-safe pauses, and display real-time counters.

---

## 🖥️ Pro-Tip: Use a Separate Browser Window

Modern browsers (Chrome, Edge, Brave) aggressively **throttle background tabs** to conserve system resources.

> [!TIP]
> **How to keep it running smoothly while working:**
> 1. Pull the Google My Activity tab out into its **own separate browser window**.
> 2. Leave that window visible on screen (side-by-side or un-minimized).
> 3. The script will continue clicking and scrolling without being throttled.

---

## ⚠️ Server-Sync Pacing: Why the Delays Matter

* **Why we wait 2.2s – 3.4s per item**: Google My Activity removes cards from your screen using optimistic rendering, but Google's database processes deletions asynchronously. Pacing ensures each transaction commits to Google's database before the next item is processed.
* **5-Second Sync Breathers**: Every 10 deletions, the script pauses for 5 seconds so Google's database write pipeline catches up completely.
* **Large histories**: If you have thousands of likes or comments, let it run in sessions.

---

## ⏸️ How to Pause or Stop
- **In Console:** Type `window.STOP_CLEANER = true;` and press Enter.
- **Immediate Stop:** Simply refresh the page (**`F5`**).

---

## 🔒 Privacy & Safety
- **100% Client-Side**: No tokens, logins, cookies, or external requests. Runs entirely inside your browser.
- **Open Source**: Plain JavaScript that can be audited directly before running.

---

## 📄 License & Attribution
Licensed under the **Apache License 2.0**.
Free for personal and commercial use. If you use, fork, or adapt this code in your own project or product, you must retain the copyright notice and provide attribution credit to the author: **Janardan Singh ([@jediubuntu](https://github.com/jediubuntu))**.

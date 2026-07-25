# Crimson Bulk Email Sender Utility

A standalone, Node.js utility and real-time dashboard to send bulk email advertisements for Crimson's **Onam Gift Combo** (Kerala Banana Chips + Sharkara Upperi).

---

## Features
- **Array Posting API**: Exposes a `POST /api/send-emails` endpoint accepting a list array of email IDs.
- **Dynamic SMTP Configuration**: Use server-side defaults via `.env` or input custom SMTP credentials dynamically directly from the Web UI.
- **Beautiful HTML Email Template**: Integrated, mobile-responsive, email-client-safe advertisement template using Crimson's traditional red/gold brand colors.
- **Real-Time Streaming Logs**: Streams delivery progress, success, and error results dynamically to the browser interface via Server-Sent Events (SSE).
- **Anti-Spam Throttling**: Automatically staggers email dispatches in 1.5-second intervals to avoid rate limits or getting flagged.
- **Simulation (Mock) Mode**: Works out-of-the-box in simulation mode if no SMTP credentials are provided, permitting full testing of UI flow and logging without sending real messages.

---

## Installation & Setup

1. **Open your terminal** and navigate to the utility folder:
   ```bash
   cd crimson_bulk_email_sender
   ```

2. **Install the dependencies**:
   ```bash
   npm install
   ```

3. **Configure your SMTP credentials (Optional)**:
   Open the [.env](.env) file in the utility folder and paste your credentials:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-gmail-app-password
   ```
   *Note: If using Gmail, you must generate a 16-character **App Password** from your Google Account settings.*

---

## Running the Application

1. **Start the server**:
   ```bash
   npm start
   ```
   The console will display: `Crimson Bulk Email Sender server is running on http://localhost:3000`

2. **Access the Dashboard**:
   Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

3. **Execute a Bulk Email Dispatch**:
   - Paste your email IDs into the textarea. You can enter them in:
     - **Comma-Separated format**: `email1@example.com, email2@example.com`
     - **JSON Array format**: `["email1@example.com", "email2@example.com"]`
   - Select either **Use Server .env** or **Custom SMTP** to configure transmission parameters.
   - Click **Dispatch Bulk Emails** and watch the live progress bar, stats counters, and detailed log updates!

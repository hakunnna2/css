# Club Points Dashboard - Serverless Edition

This project is a dashboard for managing club members, tracking participation in events, and assigning points. It is built with a React frontend (using Vite) and a serverless backend using Netlify Functions, connected to a Neon (PostgreSQL) database.

## Features

- **User View**: Public-facing view for members to check their participation and points by searching their CNI.
- **Admin View**: Secure, login-protected dashboard for managing members and events.
- **Member Management**: Add new members individually or bulk-import from a CSV file.
- **Event Management**: Create new events/sessions and manage participants.
- **Attendance & Points**: Mark participants as present/absent and assign points for each event.
- **Data Export**: Export participant lists for specific events or a full JSON backup of all data.
- **Serverless Backend**: All data is stored in a persistent Neon database, accessed via Netlify Functions.

---

## Required Setup

Before you can run or deploy this project, you need accounts for:
1.  **Neon**: For the PostgreSQL database.
2.  **Netlify**: For hosting the frontend and serverless functions.
3.  **GitHub** (or similar): To store your code and link to Netlify.

---

## 1. Database Setup (Neon)

1.  **Create a New Project** in your Neon dashboard.
2.  **Get the Connection String**:
    - On your Neon project dashboard, find the **Connection Details** widget.
    - Copy the **Connection string** (the URL that starts with `postgresql://...`). You will need this for both local setup and deployment.
3.  **Create the Database Tables**:
    - In your Neon project, go to the **SQL Editor**.
    - Copy the entire content of the `schema.sql` file from this project.
    - Paste the SQL code into the editor and click **Run**. This will create the `members`, `events`, and `participants` tables.

---

## 2. Local Development Setup

To run this project on your own computer, you need to connect it to your Neon database.

1.  **Install Dependencies**:
    Open your terminal and run:
    ```bash
    npm install
    ```

2.  **Create a Local Environment File**:
    - In the root of the project, create a new file named `.env.local`.
    - Open this file and add the following line, replacing the placeholder with the connection string you copied from Neon:
    ```
    DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
    ```
    *This file is listed in `.gitignore`, so your secret connection string will not be uploaded to GitHub.*

3.  **Run the Development Server**:
    The project uses the Netlify CLI to simulate the cloud environment locally. Run this command:
    ```bash
    netlify dev
    ```
    This will start the Vite frontend and the serverless functions together. You can now access the app at the URL provided in the terminal (usually `http://localhost:8888`).

---

## 3. Deployment to Netlify

1.  **Push Your Code**: Make sure your project code is pushed to a GitHub repository.

2.  **Create a New Site in Netlify**:
    - In your Netlify dashboard, click "Add new site" -> "Import an existing project".
    - Connect to your Git provider and select the repository for this project.

3.  **Configure Build Settings**:
    Netlify should auto-detect that you are using Vite, but ensure the settings are:
    - **Build command**: `npm run build` or `vite build`
    - **Publish directory**: `dist`
    *These settings are also defined in the `netlify.toml` file.*

4.  **Add the Database Environment Variable**:
    This is the most critical step for the live site.
    - In your Netlify site's settings, go to **Site configuration > Build & deploy > Environment variables**.
    - Click **"Add a variable"**.
    - For the **Key**, enter: `DATABASE_URL`
    - For the **Value**, paste the same Neon database connection string you used for local development.

5.  **Deploy**:
    - Go to the "Deploys" tab for your site in Netlify.
    - Click "Trigger deploy" -> "Deploy site" to build and deploy your project with the new environment variable.

After the deployment is complete, your site will be live and fully connected to your Neon database.

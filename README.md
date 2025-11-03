# Club Points Dashboard - Next.js & Vercel Edition

This is a full-stack dashboard for managing club members, tracking participation, and assigning points. It is built with the **Next.js App Router** and is designed for seamless deployment on **Vercel**. All data is stored in a **Vercel Postgres** database.

This setup provides a modern, high-performance, and scalable application where data is centralized and accessible from anywhere.

## Features

- **Next.js Framework**: Built with the latest App Router for optimal performance and developer experience.
- **Vercel Postgres**: Tightly integrated serverless database for easy setup and management.
- **Vercel Deployment**: One-click deployment and hosting.
- **Live Data**: Any updates made by an admin are instantly available to all users.
- **Secure Admin**: The admin panel is protected by a login that is securely verified by API routes.
- **User View**: A public-facing view for members to check their participation and points by searching their CNI.
- **Member Management**: Add new members individually or bulk-import from a CSV file.
- **Event Management**: Create new events/sessions and manage participants.
- **Attendance & Points**: Mark participants as present/absent and assign points for each event.
- **Data Export**: Export participant lists for specific events or a full JSON backup of all your data.

---

## How to Deploy (Beginner's Guide)

Follow these steps to get your dashboard live on the internet with Vercel.

### Step 1: Get Your Accounts Ready

If you haven't already, sign up for a free account on each of these websites:
- **GitHub**: [github.com](https://github.com) (To store your code)
- **Vercel**: [vercel.com](https://vercel.com) (Your website host, backend, and database provider)

### Step 2: Put Your Code on GitHub

1.  Create a **new, empty repository** on your GitHub account.
2.  Upload all the project files and folders into that new repository.

### Step 3: Deploy to Vercel & Create Database

Vercel makes this incredibly simple by connecting to your GitHub repository and setting up the database in one flow.

1.  **Import Your Project**:
    *   Go to your Vercel dashboard and click **"Add New..."** -> **"Project"**.
    *   Find your GitHub repository and click **"Import"**.
    *   Vercel will recognize it's a Next.js project. You can keep the default settings.
2.  **Connect the Database**:
    *   Before deploying, expand the **"Environment Variables"** section. Vercel needs to know your database connection string.
    *   Now, in a new browser tab, go to the **"Storage"** tab in your Vercel dashboard and select **"Postgres"** -> **"Create Database"**.
    *   Create a new database and give it a name.
    *   After it's created, go to the **".env.local"** tab. It will show you an environment variable named `POSTGRES_URL`. Copy its value.
    *   Go back to the project import tab. Create a new environment variable:
        *   **Key**: `POSTGRES_URL`
        *   **Value**: Paste the connection string you just copied from your Vercel Postgres database.
3.  **Deploy**:
    *   Click the **"Deploy"** button. Vercel will build and deploy your site.

### Step 4: Set Up Your Database Tables

Your database is currently empty. You need to create the tables.

1.  Go to the **"Storage"** tab in your Vercel dashboard and select your new database.
2.  Navigate to the **"Query"** tab.
3.  Open the file named **`schema.sql`** from your project code.
4.  Copy **all the text** inside that file.
5.  Paste it into the Vercel Query editor and click **"Run"**. This creates the `members`, `events`, and `participants` tables.

Your website is now live and fully connected!

---

### Local Development

1.  **Install Dependencies**: `npm install`
2.  **Link Vercel Project**: Run `vercel link` to connect your local directory to your Vercel project.
3.  **Pull Environment Variables**: Run `vercel env pull .env.local` to create a `.env.local` file with your database connection string.
4.  **Run**: `npm run dev` to start the local development server.
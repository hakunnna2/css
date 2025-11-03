# Club Points Dashboard - LocalStorage Edition

This project is a dashboard for managing club members, tracking participation in events, and assigning points. It is a client-side only application built with React (using Vite). All data is persisted directly in the user's browser via `localStorage`.

**There is no database or backend server required.** The application runs entirely in your web browser.

## Features

- **User View**: Public-facing view for members to check their participation and points by searching their CNI.
- **Admin View**: Secure, login-protected dashboard for managing members and events.
- **Member Management**: Add new members individually or bulk-import from a CSV file.
- **Event Management**: Create new events/sessions and manage participants.
- **Attendance & Points**: Mark participants as present/absent and assign points for each event.
- **Data Export**: Export participant lists for specific events or a full JSON backup of all data.
- **Persistent Local Storage**: All your data is automatically saved to your browser's `localStorage`, so it will be there the next time you open the app.

---

## How to Run This Project Locally

1.  **Prerequisites**: Make sure you have [Node.js](https://nodejs.org/) installed on your computer.

2.  **Install Dependencies**:
    Open a terminal in the project's root folder and run:
    ```bash
    npm install
    ```

3.  **Run the Development Server**:
    After the installation is complete, run the following command:
    ```bash
    npm run dev
    ```
    This will start the Vite development server. You can now access the app at the URL provided in the terminal (usually `http://localhost:5173`).

---

## How to Deploy

You can deploy this project as a static site on any hosting provider like Netlify, Vercel, or GitHub Pages.

1.  **Build the Project**:
    Run the build command in your terminal:
    ```bash
    npm run build
    ```
    This will create a `dist` folder containing the optimized, static files for your website.

2.  **Deploy the `dist` Folder**:
    Upload the contents of the `dist` folder to your hosting provider of choice. Since there is no backend, the "static site" or "Jamstack" deployment option is all you need.

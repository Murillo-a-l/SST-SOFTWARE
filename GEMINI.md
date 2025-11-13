# Project Overview

This is a React-based single-page application for managing occupational health data. It uses Vite for building and `localStorage` for data persistence. The application is designed to manage employee data, medical exams, and other related information. It also has some integration with Gemini AI.

The application is structured as a frontend-only application, with no active backend. All data is stored and managed in the browser's `localStorage`.

## Building and Running

To build and run the project, follow these steps:

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Set the `VITE_GEMINI_API_KEY`:**
    Create a `.env.local` file in the root of the project and add the following line:
    ```
    VITE_GEMINI_API_KEY=your_api_key
    ```
    Replace `your_api_key` with your actual Gemini API key.

3.  **Run the app:**
    ```bash
    npm run dev
    ```

This will start the Vite development server and open the application in your browser.

## Development Conventions

*   **Styling:** The project uses Tailwind CSS for styling.
*   **Components:** The project is structured into components, which are located in the `components` directory.
*   **Data Management:** All data is managed through the `dbService.ts` file, which uses `localStorage` for persistence.
*   **Types:** All types are defined in the `types.ts` file.
*   **Backend:** The backend is not yet implemented. The `backend/src/server.ts` file is intentionally blank.

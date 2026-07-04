# Sports Academy UI

This is the frontend user interface for the Sports Academy Management System. It is built as a single-page application (SPA) designed to communicate with the FastAPI backend.

## Technologies Used
- **React**: Component-based UI library.
- **Vite**: Next-generation frontend tooling and bundler for fast development.
- **React Router**: For declarative routing across different views.
- **Lucide React**: For clean, modern SVG icons.
- **Vanilla CSS**: Used for styling with glassmorphism and modern aesthetic principles.

## Key Features & Functionality
- **Dual Dashboards**: 
  - **Admin Dashboard**: View academy-wide metrics, manage player rosters, create/delete class schedules, manage coaches, and process manual top-ups for player wallets.
  - **Student Dashboard**: Players can view their current wallet balance, browse available classes, self-enroll, and view their attendance history.
- **Responsive Design**: Modern glassmorphic aesthetic built to work on various screen sizes.
- **Dynamic State Management**: Seamlessly fetches and updates data from the API (such as processing top-ups or cancelling enrollments) with real-time UI feedback.

## How to Run Locally

1. Ensure the backend API is already running on port `8345`.
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Start the Development Server**:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to the URL provided by Vite (typically `http://localhost:5173`).

## How to Login

The application relies on token-based authentication provided by the backend. You can use the following default test accounts to explore the platform:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@sportsacademy.com` | `admin123` | Full access to rosters, coaches, and financial management. |
| **Coach** | `testCoach@gmail.com` | `coach123` | Admin-level access to manage their specific classes and rosters. |
| **Student** | `player@sportsacademy.com` | `player123` | Restricted access; can only view personal balance and enroll in classes. |

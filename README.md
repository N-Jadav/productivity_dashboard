# Productivity Dashboard

A comprehensive productivity management application built to help you track your goals, habits, and progress over time. Visualize your productivity journey with intuitive charts, weekly/monthly breakdowns, and detailed progress tracking.

## Features

- **Goal Management**: Create, track, and manage your personal and professional goals
- **Habit Tracking**: Build and monitor daily habits with visual progress indicators
- **Weekly View**: See your weekly habits at a glance with progress rings
- **Monthly Analytics**: Track habits across entire months for comprehensive insights
- **Progress Reports**: Beautiful charts and visualizations of your productivity trends
- **Dashboard Overview**: Get a quick snapshot of your goals and habits in one place

## Tech Stack

- **Frontend**: React + TypeScript
- **Build Tool**: Vite
- **Styling**: CSS
- **Backend**: Node.js Express (local server)
- **Database**: File-based storage

## Getting Started

### Prerequisites

- Node.js (v24 or higher)
- npm or yarn

### Installation

1. Clone the repository

```bash
git clone https://github.com/N-Jadav/productivity_dashboard.git
cd productivity_dashboard
```

2. Install dependencies

```bash
npm install
```

3. Start the development server and backend

```bash
npm run dev:all
```

Alternatively, run the frontend and backend in separate terminals:

```bash
# Terminal 1 - Start the Vite dev server
npm run dev

# Terminal 2 - Start the backend server
npm run dev:server
```

4. Open your browser and navigate to `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start the Vite development server with HMR
- `npm run dev:server` - Start the backend server
- `npm run dev:all` - Run both frontend and backend together
- `npm run start` - Alias for `npm run dev:all`
- `npm run build` - Build the project for production
- `npm run preview` - Preview the production build

## Project Structure

```
src/
├── components/       # Reusable UI components
├── pages/           # Application pages (Dashboard, Goals, Habits, etc.)
├── context/         # React context for state management
├── utils/           # Utility functions
└── types.ts         # TypeScript type definitions

server/
├── db.cjs           # Database operations
├── index.cjs        # Server entry point
└── routes/          # API routes
```

## License

This project is open source and available under the MIT License.

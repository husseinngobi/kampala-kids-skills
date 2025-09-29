# Kampala Kids Life Skills Programme

A comprehensive full-stack application for managing children's life skills education and training programs.

## 🏗️ Project Structure

```text
kampala-kids-skills/
├── frontend/          # React + TypeScript + Vite frontend
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
├── backend/           # Node.js + Express + Prisma backend
│   ├── src/
│   ├── prisma/
│   ├── package.json
│   └── ...
├── package.json       # Root package.json for managing both apps
└── README.md         # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 16.0.0
- npm >= 8.0.0

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd kampala-kids-skills
```

1. Install all dependencies:

```bash
npm run install:all
```

1. Set up the database (backend):

```bash
npm run db:setup
npm run db:generate
npm run db:push
```

1. Start both frontend and backend in development mode:

```bash
npm run dev
```

This will start:

- Frontend: <http://localhost:5173>
- Backend: <http://localhost:3000>

## 📝 Available Scripts

### Root Level Commands

- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build both frontend and backend for production
- `npm run start` - Start both apps in production mode
- `npm run install:all` - Install dependencies for all projects
- `npm run lint` - Run linting for both frontend and backend

### Frontend Commands

- `npm run dev:frontend` - Start only the frontend in development
- `npm run build:frontend` - Build only the frontend
- `npm run start:frontend` - Start only the frontend in production mode

### Backend Commands

- `npm run dev:backend` - Start only the backend in development
- `npm run build:backend` - Build only the backend
- `npm run start:backend` - Start only the backend in production mode

### Database Commands

- `npm run db:setup` - Initial database setup
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:seed` - Seed database with initial data
- `npm run db:studio` - Open Prisma Studio

## 🛠️ Technology Stack

### Frontend

- **React** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Component library

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Prisma** - Database ORM
- **JWT** - Authentication
- **Multer** - File uploads
- **bcryptjs** - Password hashing

## 🌟 Features

- 📚 Curriculum management
- 👥 Student enrollment
- 📊 Progress tracking
- 🔐 User authentication
- 📱 Responsive design
- 🎯 Interactive learning modules

## 📁 Frontend Structure

```text
frontend/src/
├── components/        # Reusable UI components
├── pages/            # Page components
├── hooks/            # Custom React hooks
├── lib/              # Utilities and configurations
├── assets/           # Images, icons, etc.
└── ...
```

## 📁 Backend Structure

```text
backend/src/
├── routes/           # API route handlers
├── middleware/       # Custom middleware
├── prisma/          # Database schema and migrations
└── ...
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

---

Built with ❤️ for children's education in Kampal

# AetheraOS Frontend

Modern, production-ready React.js frontend for AetheraOS.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- Git

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
/frontend
  ├── src/
  │   ├── api/             # API service functions
  │   ├── components/      # Reusable UI components
  │   ├── sections/        # Page-level sections
  │   ├── pages/           # Route-based views
  │   ├── hooks/           # Custom React hooks
  │   ├── store/           # Global state management
  │   ├── utils/           # Helper functions
  │   ├── styles/          # Global styles & Tailwind
  │   ├── assets/          # Images, icons, fonts
  │   └── tests/           # Unit & integration tests
  ├── .eslintrc.json       # ESLint configuration
  ├── .prettierrc          # Prettier configuration
  └── vite.config.js       # Vite configuration
```

## 🛠️ Available Scripts

- `npm run dev` - Start development server on port 3000
- `npm run build` - Create production build
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors automatically
- `npm run format` - Format code with Prettier
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report

## 🎨 Tech Stack

- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** TailwindCSS
- **Routing:** React Router v6
- **State Management:** Zustand
- **Form Handling:** React Hook Form + Zod
- **HTTP Client:** Axios
- **Testing:** Jest + React Testing Library

## 📦 Key Features

- ⚡ Lightning-fast development with Vite HMR
- 🎨 Beautiful UI with TailwindCSS
- 📱 Fully responsive design
- ♿ Accessibility-first approach
- 🔒 Type-safe forms with Zod validation
- 🧪 Comprehensive test coverage
- 📦 Optimized production builds
- 🎯 Code splitting & lazy loading

## 🧭 Development Guidelines

### Component Structure
- Use functional components with hooks
- Follow PascalCase for component names
- One component per file
- Include JSDoc comments for all components

### State Management
- Use Zustand for global state
- Keep state close to where it's used
- Avoid prop drilling

### Styling
- Use TailwindCSS utility classes
- Follow mobile-first approach
- Maintain consistent spacing and colors

### Code Quality
- Run linter before commits
- Maintain 90%+ test coverage
- Follow ESLint and Prettier rules
- Write meaningful commit messages

## 🚢 Deployment

Build the project for production:

```bash
npm run build
```

The `dist/` folder contains the optimized production build ready for deployment.

## 📄 License

See LICENSE file in the root directory.

## 🤝 Contributing

Please follow the coding standards and architectural guidelines outlined in the frontend architecture document.

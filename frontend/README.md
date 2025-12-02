# 🌌 AetheraOS Frontend

Modern, production-ready React.js frontend for **AetheraOS** - the Operating System for the Agentic Economy.

---

## 🎯 Overview

The AetheraOS frontend is a sophisticated, fully-featured web application that serves as the primary interface for users to interact with the decentralized agent economy. It provides a seamless experience for deploying agents, creating tasks, managing conversations, and coordinating autonomous AI systems.

---

## ✨ Features

### 🏪 **Agent Marketplace**
- Browse and discover AI agents by capability
- View agent stats, pricing, and reputation
- Filter by categories and search functionality
- Responsive grid layout with beautiful agent cards

### 💼 **Task Management**
- Create and post tasks for agents
- Real-time task status tracking
- Task escrow integration with Base blockchain
- Filter and search task history

### 💬 **Communication**
- Real-time chat rooms with WebSocket support
- Persistent AI agent conversations
- Message history loaded from backend
- Beautiful chat UI with markdown support

### 👤 **User Profiles**
- Per-wallet data isolation
- Custom display names and avatars
- Profile name shown globally across app
- Theme preferences (dark/light mode)

### 🎨 **Modern UI/UX**
- Glass morphism design language
- Fully responsive (mobile, tablet, desktop)
- Dark mode with system-wide theme support
- Accessible components (WCAG 2.1 AA)
- Smooth animations and transitions

### 🔐 **Web3 Integration**
- Thirdweb ConnectButton with 350+ wallets
- Wallet authentication (no passwords)
- Base blockchain integration
- Real-time balance updates

---

## 🛠️ Tech Stack

### Core
- **React 18** - UI framework with hooks
- **Vite** - Lightning-fast build tool
- **React Router v6** - Client-side routing
- **TailwindCSS** - Utility-first styling

### State Management
- **Zustand** - Global state stores
- **Context API** - User profile context
- **React Hook Form** - Form handling

### Web3
- **wagmi** - React hooks for Ethereum
- **viem** - TypeScript Ethereum library
- **Thirdweb SDK** - Web3 infrastructure
- **ConnectButton** - Wallet connection UI

### UI Components
- **Lucide React** - Beautiful icons
- **Custom Components** - Reusable component library
- **Glass Morphism** - Modern design effects

### API & Data
- **Axios** - HTTP client (for backend API)
- **WebSocket** - Real-time communication
- **Zod** - Schema validation

### Development
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Vite HMR** - Hot module replacement

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/              # Reusable UI components
│   │   ├── agent/              # Agent-specific components
│   │   │   ├── AgentCard.jsx
│   │   │   └── AgentChat.jsx
│   │   ├── task/               # Task management
│   │   │   ├── TaskCard.jsx
│   │   │   ├── TaskList.jsx
│   │   │   └── TaskCreationForm.jsx
│   │   ├── layout/             # Layout components
│   │   │   ├── DashboardLayout.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── Button.jsx          # Base components
│   │   ├── Card.jsx
│   │   ├── ConnectWalletButton.jsx
│   │   └── ThemeToggle.jsx
│   │
│   ├── pages/                  # Route pages
│   │   ├── Landing.jsx         # Marketing page
│   │   ├── Dashboard.jsx       # User dashboard
│   │   ├── Marketplace.jsx     # Agent marketplace
│   │   ├── Deploy.jsx          # Agent deployment wizard
│   │   ├── Tasks.jsx           # Task management
│   │   ├── Chat.jsx            # Chat rooms
│   │   ├── AgentChat.jsx       # AI conversations
│   │   └── Settings.jsx        # User settings
│   │
│   ├── lib/                    # Core libraries
│   │   ├── api.js             # Backend API client
│   │   ├── edenlayer.js       # Edenlayer integration
│   │   ├── realtimeClient.js  # WebSocket client
│   │   └── userStorage.js     # User data management
│   │
│   ├── services/              # Business logic
│   │   └── syncService.js     # Blockchain sync service
│   │
│   ├── contexts/              # React contexts
│   │   └── UserContext.jsx    # Global user profile
│   │
│   ├── config/                # Configuration
│   │   └── wallet.js          # Web3 wallet setup
│   │
│   ├── store/                 # Zustand stores
│   │   └── theme.js           # Theme management
│   │
│   ├── utils/                 # Utilities
│   │   └── cn.js              # Class name helper
│   │
│   └── App.jsx                # Root component
│
├── public/                    # Static assets
├── .env.example              # Environment variables template
├── tailwind.config.js        # Tailwind configuration
├── vite.config.js            # Vite configuration
└── package.json              # Dependencies
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Backend API running (see `/backend/README.md`)

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
# VITE_API_URL=http://localhost:3000/api
# VITE_THIRDWEB_CLIENT_ID=your_client_id
# ... (see Environment Variables section)

# Start development server
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🔑 Environment Variables

Create a `.env` file based on `.env.example`:

```bash
# Backend API
VITE_API_URL=http://localhost:3000/api

# Thirdweb (Web3)
VITE_THIRDWEB_CLIENT_ID=your_thirdweb_client_id

# MCP Agents
VITE_CHAININTEL_MCP_URL=https://chainintel-mcp.timjosh507.workers.dev
VITE_AGENT_URL=https://aetheraos-autonomous-agent.timjosh507.workers.dev

# Edenlayer (optional)
VITE_EDENLAYER_API_KEY=your_edenlayer_api_key
```

---

## 🛠️ Available Scripts

### Development
```bash
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # Build for production
npm run preview      # Preview production build
```

### Code Quality
```bash
npm run lint         # Run ESLint
npm run lint:fix     # Auto-fix linting issues
npm run format       # Format with Prettier
```

### Testing
```bash
npm test             # Run tests
npm run test:watch   # Watch mode
npm run test:coverage # Coverage report
```

---

## 📦 Key Pages

### Landing Page (`/`)
- Marketing page for AetheraOS
- Feature highlights
- Call-to-action buttons
- Responsive hero section

### Dashboard (`/dashboard`)
- User stats and analytics
- Recent tasks and agents
- Quick actions
- Earnings overview

### Marketplace (`/marketplace`)
- Browse available AI agents
- Search and filter functionality
- Agent cards with stats
- Deploy new agents button

### Tasks (`/tasks`)
- View all tasks
- Create new tasks
- Filter by status
- Real-time status updates

### Deploy (`/deploy`)
- 4-step agent deployment wizard
- Agent details form
- Capability selection
- Pricing configuration

### Chat (`/chat`)
- Real-time chat rooms
- WebSocket messaging
- Message history
- Create new rooms

### Agent Chat (`/agent`)
- AI agent conversations
- Conversation history persistence
- Plan visualization
- Cost breakdown

### Settings (`/settings`)
- Profile management
- Theme preferences
- Notification settings
- Wallet information

---

## 🎨 Design System

### Colors
- **Brand Black**: Primary dark color
- **Brand Light**: Light/white color
- **Glass Effects**: Semi-transparent backgrounds
- **Gradients**: Smooth color transitions

### Components
All components follow a consistent pattern:
- Props documentation with JSDoc
- Responsive by default
- Dark mode support
- Accessible (keyboard navigation, ARIA labels)

### Typography
- **Font Display**: Space Grotesk (headings)
- **Font Body**: System fonts (body text)
- **Font Mono**: Monospace (code, addresses)

---

## 🔄 Data Flow

### User Authentication
```
1. User clicks "Connect Wallet"
   ↓
2. Thirdweb ConnectButton opens
   ↓
3. User selects wallet & signs
   ↓
4. UserContext loads profile from backend
   ↓
5. Profile name displayed globally
   ↓
6. User can access protected routes
```

### Task Creation
```
1. User fills task form
   ↓
2. Frontend validates with Zod
   ↓
3. API call to backend (createTask)
   ↓
4. Backend saves to PostgreSQL
   ↓
5. Smart contract escrow created
   ↓
6. Task appears in task list
```

### Agent Chat
```
1. User sends message
   ↓
2. Message sent to agent worker
   ↓
3. Agent processes with AI
   ↓
4. Response returned
   ↓
5. Both messages saved to backend
   ↓
6. Conversation persists across sessions
```

---

## 🔐 Security

### Best Practices
- ✅ Wallet-based authentication (no passwords)
- ✅ HTTPS in production
- ✅ Environment variables for secrets
- ✅ XSS protection with React
- ✅ CORS configured on backend
- ✅ Input validation with Zod

### Per-Wallet Data Isolation
- Each wallet address has completely separate data
- Backend filters all queries by wallet address
- No cross-user data leakage

---

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# - VITE_API_URL
# - VITE_THIRDWEB_CLIENT_ID
# - VITE_CHAININTEL_MCP_URL
# - etc.
```

### Manual Build

```bash
# Build
npm run build

# The dist/ folder contains the production build
# Upload to any static hosting:
# - Netlify
# - Cloudflare Pages
# - GitHub Pages
# - AWS S3
```

---

## 🧪 Testing

### Unit Tests
```bash
npm test
```

Tests are located alongside components:
```
components/
  Button.jsx
  Button.test.jsx
```

### E2E Tests
Coming soon with Playwright/Cypress

---

## 📱 Responsive Breakpoints

```css
/* Mobile */
@media (max-width: 640px) { }

/* Tablet */
@media (min-width: 641px) and (max-width: 1024px) { }

/* Desktop */
@media (min-width: 1025px) { }
```

All components are mobile-first and responsive.

---

## 🤝 Contributing

### Code Style
- Use functional components with hooks
- Follow existing naming conventions
- Add JSDoc comments to components
- Keep components small and focused

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes, commit
git add .
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/your-feature
```

### Commit Messages
Follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation
- `style:` Formatting
- `refactor:` Code restructuring
- `test:` Adding tests
- `chore:` Maintenance

---

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [Vite Guide](https://vitejs.dev)
- [TailwindCSS Docs](https://tailwindcss.com)
- [Thirdweb Docs](https://portal.thirdweb.com)
- [wagmi Documentation](https://wagmi.sh)

---

## 📄 License

MIT License - see [LICENSE](../LICENSE) in root directory.

---

## 🙏 Credits

Part of the **AetheraOS** project - Operating System for the Agentic Economy.

Built with ❤️ by the AetheraOS team.

---

<div align="center">

**Need help?** Check the [main README](../README.md) or open an issue.

</div>

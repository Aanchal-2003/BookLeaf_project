# BookLeaf Frontend Client (`client`)

Single Page Application (SPA) built with React 18, Vite, Tailwind CSS, and Lucide Icons. Provides dual-portal access for BookLeaf Authors and Operations Staff.

---

## Directory Structure

```
client/
├── public/
│   ├── favicon.svg             # Application brand icon
│   └── robots.txt              # Search indexing rules
├── src/
│   ├── api/
│   │   └── client.js           # Axios instance with credentials & unified error handler
│   ├── components/
│   │   └── common/
│   │       ├── EmptyState.jsx      # Generic empty state UI placeholder
│   │       ├── LoadingSpinner.jsx  # Multi-size branded loading indicator
│   │       ├── Navbar.jsx          # Dual-role navigation with badge counters & logout modal
│   │       └── StatusBadge.jsx     # Semantic status, priority, and category badges
│   ├── context/
│   │   └── AuthContext.jsx     # Role-aware authentication context & session lifecycle
│   ├── layouts/
│   │   ├── AdminLayout.jsx     # Operations workbench wrapper & guard
│   │   └── AuthorLayout.jsx    # Author portal wrapper & guard
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── AdminDashboard.jsx     # Operations metrics hub & category breakdown
│   │   │   ├── AdminLogin.jsx         # Staff-only credentials screen
│   │   │   ├── AdminTicketDetail.jsx  # Operations workbench, AI draft studio & audit trail
│   │   │   └── AdminTicketQueue.jsx   # Full-width search & interactive queue filter popover
│   │   └── author/
│   │       ├── AuthorBooks.jsx        # Author book catalog, royalties & search popover
│   │       ├── AuthorCreateTicket.jsx # 2-Column web-view ticket creation form
│   │       ├── AuthorDashboard.jsx    # Compact financial metrics & paginated query table
│   │       ├── AuthorLogin.jsx        # Author credentials screen
│   │       ├── AuthorTicketDetail.jsx # Live thread conversation stream with 5s polling
│   │       └── AuthorTickets.jsx      # Paginated ticket list with full-width search
│   ├── App.jsx                 # Route definitions & portal redirect routing
│   ├── index.css               # Design system typography, utilities, and custom tokens
│   └── main.jsx                # React DOM root mounting
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── vite.config.js
```

---

## Scripts

```bash
# Start Vite development server (with /api proxy to localhost:5000)
npm start
# or
npm run dev

# Compile production bundle
npm run build

# Preview production build locally
npm run preview
```

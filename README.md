<h1>ClinicEase a AI powered smart health checkup</h1>
<h6>Author-Sowmik Noor</h6>

ClinicEase is a full-stack smart healthcare platform designed to support patients, doctors, and administrators in one role-based application.

It focuses on real-world clinical workflows relevant to Bangladesh, including bilingual user experiences (Bangla + English), teleconsultation support, home-visit workflows, prescription and lab test management, billing with PDF invoices, and health community engagement.

## Why ClinicEase

Traditional healthcare workflows are often fragmented across calls, paper records, and disconnected systems. ClinicEase brings core operations into one digital platform so users can:

- Discover and interact with doctors
- Book appointments and manage consultations
- Create and review prescriptions and lab tests
- Track invoices and payment status
- Follow medication reminders and adherence
- Participate in trusted health discussions

## Core Features

### Authentication and Access Control

- Secure login and registration
- Role-based route protection
- JWT-backed session management

### Patient Features

- Book appointments and request home visits
- View prescriptions, lab tests, and medical history
- Manage medicine reminders
- Access invoices and payment progress
- Participate in community discussions

### Doctor Features

- Review and manage appointment/home-visit requests
- Create prescriptions and lab test orders
- Generate invoices
- Communicate with patients

### Admin Features

- Manage platform-level users and operations
- Moderate community content
- Oversee system-level workflows

### Clinical and Utility Modules

- Prescription workflow
- Lab test ordering flow
- Invoice generation and downloadable PDF support
- Medicine search/autocomplete assistance
- Community forum and health pages
- Dark mode and responsive UI

## Tech Stack

### Frontend

- React 19
- Vite
- Tailwind CSS
- jsPDF

### Backend

- Node.js
- Express
- MongoDB + Mongoose
- JSON Web Token
- bcryptjs
- multer
- axios

## Architecture Overview

ClinicEase follows a client-server model:

1. The React frontend sends requests to Express APIs.
2. Backend routes validate auth and role permissions.
3. Controllers execute business workflows.
4. Mongoose models persist and fetch data from MongoDB.
5. UI updates based on role, state, and language preference.

## Repository Structure

```text
ClinicEase/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── tests/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
├── scripts/
│   └── start-all.sh
├── start-servers.sh
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- MongoDB instance (local or cloud)

### 1. Clone Repository

```bash
git clone https://github.com/sowmiknoor/ClinicEase.git
cd ClinicEase
```

### 2. Install Dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 3. Configure Environment

Create a file at backend/.env:

```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_secret
CLIENT_URL=http://localhost:5173
```

### 4. Run in Development

Option A: Run separately

```bash
# Terminal 1
cd backend
npm run dev

# Terminal 2
cd frontend
npm run dev
```

Option B: Use helper script

```bash
./start-servers.sh
```

Default local URLs:

- Frontend: http://localhost:5173
- Backend: http://localhost:5001

## Available Scripts

### Backend (backend/package.json)

- npm run dev: Start backend with nodemon
- npm start: Start backend with node
- npm test: Placeholder script

### Frontend (frontend/package.json)

- npm run dev: Start Vite dev server
- npm run build: Build production assets
- npm run preview: Preview production build
- npm run lint: Run ESLint

## API Surface (High-Level)

The backend provides REST APIs for:

- Authentication and user profiles
- Appointment and consultation operations
- Home visit workflow
- Prescription and lab test management
- Invoicing and payment lifecycle
- Forum and health-tip content

For route-level details, review backend/routes and controller implementations.

## Testing and Validation

Current repository emphasis is feature-level and manual QA validation with documented checklists.

Useful docs:

- QUICK_START_GUIDE.md
- TESTING_CHECKLIST.md
- QA_TESTING_GUIDE.md
- TESTING_REPORT_COMPLETE.md

Recommended validation flow:

1. Verify login and role-based routing.
2. Test patient appointment and doctor response lifecycle.
3. Verify prescription, lab test, and invoice workflows.
4. Validate language switching and dark mode persistence.
5. Check mobile responsiveness and PDF output.

## Deployment Notes

- Configure secure production secrets for JWT and DB credentials.
- Set frontend API base URL to deployed backend.
- Restrict CORS to trusted frontend origins.
- Enforce HTTPS and secure headers in production.
- Add request validation and upload restrictions on sensitive endpoints.

## Security Considerations

- Never commit .env files or secrets.
- Apply strict role checks on protected routes.
- Sanitize and validate request payloads.
- Use strong password hashing and token expiration policies.

## Documentation Map

This repository includes extensive project documentation. Start with:

- DOCUMENTATION_INDEX.md
- QUICK_START_GUIDE.md
- IMPLEMENTATION_GUIDE.md
- SRS_DOCUMENT.md
- PROJECT_COMPLETION_SUMMARY.md

Additional docs cover UI, UX, dark mode, forum, billing, medicine databases, and feature-level implementation reports.

## Contributing

1. Fork the repository.
2. Create a branch: feature/your-change
3. Keep commits focused and clear.
4. Run lint/build checks before submitting.
5. Open a pull request with context and screenshots (if UI changes).

## Roadmap

- Production-grade payment provider integration
- Stronger automated testing coverage
- Real-time communication enhancements
- Advanced analytics and reporting
- Performance and accessibility hardening

## Author

Sowmik Noor

---

If this project helps you, consider starring the repository to support continued development.

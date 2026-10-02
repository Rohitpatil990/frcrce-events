# Event, Workshop & FDP Management System

A comprehensive web-based platform designed to streamline the planning, execution, and documentation of academic events at Fr. Conceicao Rodrigues College of Engineering (FRCRCE).

## 📋 Features

### Admin Features
- Dashboard with system statistics
- Approve/Reject event proposals
- User management (Create, Update, Deactivate)
- System-wide analytics and reports
- View all events and registrations

### Faculty Features
- Create event proposals
- View proposal status (Pending/Approved/Rejected)
- View registered students
- Mark attendance digitally
- Generate certificates automatically
- View event analytics

### Student Features
- Browse approved events
- Register for events with seat availability check
- View registration status and waitlist
- Download certificates
- Submit event feedback
- View attendance history

## 🚀 Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcrypt for password hashing
- **Certificate Generation**: PDFKit

## 📁 Project Structure

```
event-management-system/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── eventController.js
│   │   ├── registrationController.js
│   │   ├── attendanceController.js
│   │   ├── certificateController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Event.js
│   │   ├── Registration.js
│   │   ├── Attendance.js
│   │   └── Certificate.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── eventRoutes.js
│   │   ├── registrationRoutes.js
│   │   ├── attendanceRoutes.js
│   │   ├── certificateRoutes.js
│   │   └── adminRoutes.js
│   └── utils/
│       └── certificateGenerator.js
├── frontend/
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   └── api.js
│   └── pages/
│       ├── login.html
│       ├── admin-dashboard.html
│       ├── admin-events.html
│       ├── admin-users.html
│       ├── faculty-dashboard.html
│       ├── create-event.html
│       ├── student-dashboard.html
│       ├── event-details.html
│       ├── attendance.html
│       ├── my-registrations.html
│       └── my-certificates.html
├── public/
│   └── certificates/
├── .env.example
├── scripts/
│   └── create-admin.js
├── scripts/
│   └── create-admin.js
├── package.json
├── server.js
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Step 1: Install Dependencies
```bash
npm ci
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env` and set values appropriate for your environment:

```env
PORT=3000
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/event_management_system
JWT_SECRET=replace_with_a_unique_random_secret_at_least_32_characters
JWT_EXPIRE=7d
SESSION_SECRET=replace_with_a_unique_random_session_secret
MAX_FILE_SIZE=5242880
CERTIFICATE_PATH=./public/certificates
CORS_ORIGIN=
ALLOW_DEMO_SEED=false
```

Use a managed MongoDB connection string in production. Generate new, unique secrets and configure them as host environment variables; never commit `.env`. `CORS_ORIGIN` should contain only trusted origins when the API is called from a separate frontend. Same-origin deployments can leave it empty. Configure `CERTIFICATE_PATH` to a persistent writable volume on hosts with ephemeral filesystems so generated certificates survive restarts and redeployments.

### Step 3: Start MongoDB
Make sure MongoDB is running:
```bash
# On Linux/Mac
sudo systemctl start mongod

# On Windows
net start MongoDB

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Step 4: Create the Initial Admin User
Set these environment variables temporarily or in your deployment host's protected environment settings, then run the one-time setup script:

```powershell
$env:ADMIN_NAME="Your Name"
$env:ADMIN_EMAIL="you@example.com"
$env:ADMIN_PASSWORD="use-a-unique-password-of-at-least-12-characters"
npm run admin:create
```

The script creates one administrator and refuses to overwrite an existing account. Create all later user accounts through the administrator-only Users page.

### Step 5: Start the Server
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The server will start at `http://localhost:3000`. The login page does not create accounts; contact an administrator.

## ☁️ Deployment

GitHub stores the source code but GitHub Pages cannot run this Express server or MongoDB. Deploy the Node.js app to a Node-capable host and use a managed MongoDB database. Configure the production environment variables in the host dashboard, set `NODE_ENV=production`, use HTTPS, set a unique `JWT_SECRET` (at least 32 characters), and set `MONGODB_URI` to the managed database. Run `npm ci` for install and `npm start` as the start command. The `/api/health` endpoint returns `200` only after MongoDB is connected.

Create the first admin using the one-time setup script in Step 4. Keep all credentials in the host's secret manager and remove the setup variables afterward. Do not enable demo seeding in production.

### Deploying a preview to Vercel

The repository includes a Vercel serverless entry point and rewrite configuration. In Vercel, import `Rohitpatil990/-frcrce-events`, use the repository root as the Root Directory, leave the framework preset as **Other**, and leave the build and output directory fields empty. Vercel installs dependencies from `package-lock.json`.

Add these Environment Variables in the Vercel project settings for the Preview and Production environments:

- `NODE_ENV`: `production`
- `MONGODB_URI`: connection string for a managed MongoDB database
- `JWT_SECRET`: a unique random value of at least 32 characters

Set `CORS_ORIGIN` only if the browser frontend and API use different origins; otherwise leave it unset for same-origin requests. Redeploy after adding or changing environment variables. Use a separate non-production database for Preview deployments.

Vercel's function filesystem is temporary. For this preview, generated certificate PDFs are written under `/tmp` and can disappear between requests or deployments; certificate downloads are therefore not durable. Configure external persistent object storage before relying on certificates in production. Vercel functions are also request-based, so this deployment does not run a persistent background process.

Create the initial administrator against the same managed database by running `npm run admin:create` locally with `MONGODB_URI`, `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` set in the terminal. Do not add bootstrap credentials or `.env` to Vercel or GitHub. After the one-time setup, remove the `ADMIN_*` variables from the terminal/session.

The project includes basic API and page smoke tests. With the app running and a test database containing accounts for each role, set `TEST_ADMIN_EMAIL`, `TEST_ADMIN_PASSWORD`, `TEST_FACULTY_EMAIL`, `TEST_FACULTY_PASSWORD`, `TEST_STUDENT_EMAIL`, and `TEST_STUDENT_PASSWORD`, then run:

```bash
npm test
```

### Optional development demo data
Never run demo seeding against production data. To add the sample accounts only to a development database:

```powershell
$env:NODE_ENV="development"
$env:ALLOW_DEMO_SEED="true"
node seedData.js
```

The seed script does not delete or modify existing accounts.

## 📖 Usage Guide

### For Faculty:
1. Login with faculty credentials
2. Navigate to "Create Event"
3. Fill in event details (title, type, date, venue, capacity, etc.)
4. Submit for admin approval
5. Once approved, event becomes visible to students
6. After event day, mark attendance
7. Generate certificates for present students

### For Admin:
1. Login with admin credentials
2. View pending event proposals in dashboard
3. Review event details
4. Approve or Reject with remarks
5. Manage users and view analytics

### For Students:
1. Login with student credentials
2. Browse available events
3. Click "View Details" to see event information
4. Register for events (subject to seat availability)
5. View registration status in "My Registrations"
6. After event completion, download certificates

## 🔒 Security Features

- Password hashing using bcrypt
- JWT-based authentication
- Role-based access control (RBAC)
- HTTP-only cookies
- Input validation
- Administrator-controlled account provisioning
- Production startup checks for a strong JWT secret and database URI
- SameSite, HTTP-only authentication cookies (Secure in production)
- HTML escaping for user/event content rendered by the interface

## 📊 Database Schema

### Users Collection
- Fields: name, email, password, role, department, year, rollNumber, phone, isActive

### Events Collection
- Fields: title, type, description, dates, venue, capacity, status, createdBy, eligibility

### Registrations Collection
- Fields: user, event, status, registeredAt, feedback

### Attendance Collection
- Fields: registration, event, user, present, markedBy, markedAt

### Certificates Collection
- Fields: registration, event, user, certificateUrl, certificateNumber, issueDate

## 🎯 Event Lifecycle

1. **Creation**: Faculty creates event proposal → Status: Pending
2. **Approval**: Admin reviews → Status: Approved/Rejected
3. **Registration**: Students register → Confirmed/Waitlist
4. **Execution**: Event takes place
5. **Attendance**: Faculty marks attendance
6. **Certification**: System generates certificates
7. **Download**: Students download certificates

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Check connection
mongo --eval "db.adminCommand('ping')"
```

### Port Already in Use
```bash
# Change PORT in .env file or kill process
lsof -ti:3000 | xargs kill -9
```

### Certificate Generation Fails
- Ensure `public/certificates` directory exists and has write permissions
- Check PDFKit installation: `npm install pdfkit`

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Event Endpoints
- `GET /api/events` - Get all events (filtered by role)
- `POST /api/events` - Create event (Faculty)
- `GET /api/events/:id` - Get event details
- `PUT /api/events/:id/approve` - Approve/Reject event (Admin)

### Registration Endpoints
- `POST /api/registrations/:eventId` - Register for event
- `GET /api/registrations/my` - Get user's registrations
- `DELETE /api/registrations/:id` - Cancel registration

### Attendance Endpoints
- `POST /api/attendance/event/:eventId` - Mark attendance
- `GET /api/attendance/event/:eventId` - Get event attendance

### Certificate Endpoints
- `POST /api/certificates/event/:eventId/generate` - Generate certificates
- `GET /api/certificates/my` - Get user's certificates
- `GET /api/certificates/:id/download` - Download certificate

## 🤝 Contributing

This is an academic project for FRCRCE. Please do not include real personal data or production secrets in issues or sample data.

## 👨‍💻 Developers

- Rohit Patil
- Anurag Sharma
- Shahaan Tufail

**Department**: Electronics & Computer Science  
**College**: Fr. Conceicao Rodrigues College of Engineering  
**University**: Mumbai University  
**Academic Year**: 2025-26

## 📄 License

This project is developed for academic purposes at FRCRCE.

---

**Note**: This system is designed specifically for FRCRCE but follows standard architectural patterns applicable to any educational institution.
# -frcrce-events

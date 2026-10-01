# Geofencing & Location Event Detection System

A full-stack location-based geofencing system that allows administrators to create geographical boundaries and detects when registered devices enter, exit, or remain inside those boundaries.

The system supports circular and polygon-based geofences, device location tracking, event detection, event history, audit logging, authentication, and map visualization.

---

## Features

### Authentication & Authorization

- User registration and login
- JWT-based authentication
- Role-based access control
- Admin and regular user access
- Protected API endpoints
- Active/inactive user handling

### Geofence Management

- Create geofences
- Update geofences
- Delete geofences
- Enable/disable geofences
- Circular geofences
- Polygon-based geofences
- Geofence descriptions
- Geofence event rules

### Device Management

- Register devices
- View registered devices
- Enable/disable devices
- Delete devices
- Device ownership validation

### Location Tracking

- Submit device latitude and longitude
- GPS accuracy support
- Location timestamp
- Location history storage
- Coordinate validation
- GPS accuracy threshold handling

### Geofence Event Detection

The system detects:

- ENTER
- EXIT
- INSIDE
- OUTSIDE

The system tracks state transitions and avoids generating duplicate ENTER/EXIT events for repeated locations.

### Map Visualization

- OpenStreetMap integration
- Leaflet-based map
- Circular geofences
- Polygon geofences
- Geofence visualization
- Geofence rule access from the map

### Event History

- View geofence events
- Device-based event history
- Geofence-based event history
- Previous state
- Current state
- Event coordinates
- Event timestamp

### Audit Logging

Administrative actions are recorded in audit logs, including:

- Geofence creation
- Geofence updates
- Geofence deletion
- Entity information
- User information
- Action description
- Timestamp

---

## Technology Stack

### Backend

- Python 3.13
- FastAPI
- SQLAlchemy
- MySQL 8.0
- Alembic
- Pydantic
- Pydantic Settings
- JWT
- Passlib
- bcrypt
- Python-Jose
- PyMySQL

### Frontend

- React
- TypeScript
- Vite
- Material UI
- Axios
- React Router
- Leaflet
- React Leaflet
- Recharts

### DevOps

- Docker
- Docker Compose
- Nginx

### Development Tools

- Visual Studio Code
- MySQL Workbench
- Postman
- Swagger / OpenAPI
- Git
- GitHub

---

## System Architecture

```text
                    ┌──────────────────────┐
                    │      React UI        │
                    │  React + TypeScript  │
                    └──────────┬───────────┘
                               │
                               │ Axios / HTTP
                               ▼
                    ┌──────────────────────┐
                    │     FastAPI API      │
                    │   JWT Authentication │
                    └──────────┬───────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
        ┌───────────┐    ┌────────────┐   ┌──────────────┐
        │ Geofence  │    │  Location  │   │    Events    │
        │  Engine   │    │  Tracking  │   │ & Audit Logs │
        └─────┬─────┘    └─────┬──────┘   └──────────────┘
              │                │
              └────────┬───────┘
                       ▼
                ┌──────────────┐
                │    MySQL     │
                │   Database   │
                └──────────────┘

Project Structure
geofencing-location-system/
│
├── backend/
│   ├── app/
│   │   ├── core/
│   │   ├── models/
│   │   ├── routers/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── main.py
│   │
│   ├── alembic/
│   ├── tests/
│   ├── .dockerignore
│   ├── .env.example
│   ├── Dockerfile
│   ├── alembic.ini
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   ├── devices/
│   │   │   ├── geofences/
│   │   │   ├── locations/
│   │   │   └── events/
│   │   ├── services/
│   │   ├── styles/
│   │   ├── types/
│   │   └── App.tsx
│   │
│   ├── .dockerignore
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.ts
│
├── docker-compose.yml
└── README.md

Database Design
The system uses MySQL.
Main tables:
users
devices
geofences
geofence_points
geofence_rules
location_events
geofence_events
audit_logs

Users
Stores registered application users and their roles.
Devices
Stores devices assigned to users.
Geofences
Stores circular and polygon geofence definitions.
Geofence Points
Stores polygon coordinates and their order.
Geofence Rules
Stores enabled event types for individual geofences.
Location Events
Stores submitted device locations.
Geofence Events
Stores detected state transitions and geofence events.
Audit Logs
Stores administrative actions.
Geofencing Logic
Circular Geofence
The system calculates the distance between the device location and the geofence center using the Haversine formula.
Distance <= Radius
        │
        ├── Yes → INSIDE
        │
        └── No  → OUTSIDE

Polygon Geofence
Polygon containment is determined using point-in-polygon logic, including boundary handling.
State Transition Logic
The system maintains the previous geofence state and compares it with the current state.
OUTSIDE → INSIDE
        = ENTER

INSIDE → OUTSIDE
        = EXIT

INSIDE → INSIDE
        = No transition

OUTSIDE → OUTSIDE
        = No transition

Event rules determine whether a particular event should be recorded.
GPS Accuracy
The system supports GPS accuracy values.
The configured default threshold is:
50 meters

If the submitted GPS accuracy exceeds the configured threshold, the location is stored but geofence processing is skipped.
This helps reduce unreliable geofence decisions caused by inaccurate GPS readings.
Backend API
The FastAPI backend provides APIs for:
/auth
/devices
/geofences
/geofences/{id}/rules
/locations
/events
/audit-logs

Swagger API documentation is available when the backend is running:
http://127.0.0.1:8000/docs

Frontend Pages
The frontend contains:
Login / Registration
User authentication and registration.
Dashboard
Displays:
- Active geofences
- Registered devices
- Today's events
- Event activity
- Event distribution
- Recent events
Geofences
Manage:
- Create
- Edit
- Enable/disable
- Delete
- Rules
- Map
Geofence Rules
Configure:
- ENTER
- EXIT
- INSIDE
- OUTSIDE
Geofence Map
Displays active geofences using Leaflet and OpenStreetMap.
Devices
Manage registered devices.
Locations
Submit device location information.
Events
View generated geofence events.
Audit Logs
View administrative activity.

Backend Setup
Go to the backend:
cd backend

Create a virtual environment:
python -m venv venv

Activate it on Windows:
venv\Scripts\activate

Install dependencies:
pip install -r requirements.txt

Create .env from .env.example.
Configure:
APP_NAME=Geofencing & Location Event Detection System
APP_VERSION=1.0.0

DATABASE_URL=mysql+pymysql://username:password@localhost:3306/geofencing_db

MAX_GPS_ACCURACY=50

Run migrations:
alembic upgrade head

Start FastAPI:
uvicorn app.main:app --reload

Backend:
http://127.0.0.1:8000

Swagger:
http://127.0.0.1:8000/docs

Frontend Setup
Open another terminal:
cd frontend

Install dependencies:
npm install

Start development server:
npm run dev

Frontend:
http://localhost:5173

Docker Setup
The project includes Docker support for both backend and frontend.
Build the services:
docker compose build

Start the application:
docker compose up -d

Check running containers:
docker compose ps

Stop the application:
docker compose down

The Docker setup contains:
Backend
    FastAPI + Uvicorn

Frontend
    React + Vite build + Nginx

Testing
Backend tests were created for:
- Authentication
- Device management
- Geofence management
- Geofence calculations
- Location processing
- Event detection
- API authorization
- Ownership validation
Run backend tests with:
pytest

Postman
The backend APIs can also be tested using Postman.
Recommended testing flow:
Register
   ↓
Login
   ↓
Get current user
   ↓
Create device
   ↓
Create geofence
   ↓
Create geofence rules
   ↓
Submit location
   ↓
Check geofence events
   ↓
Check audit logs

Security
The project uses:
- JWT authentication
- Password hashing
- Role-based authorization
- Device ownership validation
- Protected admin endpoints
- Environment variables for configuration
- .env excluded from Docker build context
Never commit the actual .env file or database credentials to GitHub.
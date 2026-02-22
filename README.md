# Respondr

Respondr is an AI-powered emergency response platform designed to bridge the critical gap between a medical incident and professional assistance. In emergency situations such as cardiac arrest, seizures, or severe injury, immediate guidance can significantly improve outcomes. Respondr connects patients to verified doctors and trained volunteers in real time while securely sharing live health data from wearable devices.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (3.11+)

---

### 🖥️ Frontend (React + Vite)

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`.

---

### 🧠 Backend (FastAPI)

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment:**
   ```bash
   python -m venv venv
   # macOS/Linux:
   source venv/bin/activate
   # Windows:
   venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the server:**
   ```bash
   python main.py
   ```
   The API will be available at `http://localhost:3001`.

## 🏗️ Tech Stack

### Frontend
- **Framework**: React 19.2.0 with TypeScript 5.9.3
- **Build Tool**: Vite 7.3.1
- **Styling**: Tailwind CSS v4.2.0
- **Routing**: React Router DOM 7.13.0
- **HTTP Client**: Axios 1.13.5
- **Icons**: Lucide React 0.574.0
- **Animations**: Lottie React 2.4.1
- **Charts**: Recharts 3.7.0
- **Backend Integration**: Supabase JS 2.97.0

### Backend
- **Framework**: FastAPI (latest)
- **Server**: Uvicorn (latest)
- **ORM**: SQLAlchemy (latest)
- **Database Driver**: AsyncPG (latest)
- **Authentication**: PyJWT (latest)
- **Environment Config**: Python-dotenv (latest)
- **Task Scheduling**: APScheduler (latest)
- **HTTP Client**: HTTPX (latest)

### Database & Data
- **Primary Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **Real-time Subscriptions**: Supabase Realtime

### Third-Party Integrations

| Service | Purpose | Use Case |
|---------|---------|----------|
| **Supabase** | Backend-as-a-Service, PostgreSQL, Auth, Storage | User authentication, data persistence, file uploads |
| **Daily.co** | Video call infrastructure | Peer-to-peer video consultations between patients and doctors |
| **Google Gemini** | AI/LLM capabilities | Intelligent medical guidance, response generation, analysis |
| **ElevenLabs** | Text-to-speech synthesis | Voice guidance during emergencies, accessibility features |
| **Twilio** | SMS & voice communications | Emergency notifications, automated voice calls, patient alerts |
| **Presage ResQ** | Wearable device integration | Real-time vital sign monitoring, automatic emergency detection |

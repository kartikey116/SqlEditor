# CipherSQLStudio

![Home Preview](home.png)
*(Home Page)*

![Login Preview](loginpage.png)
*(Login Page)*

 CipherSQLStudio is an interactive, browser-based SQL challenge platform. It allows users to write, execute, and evaluate authentic PostgreSQL queries against isolated, transaction-backed data sandboxes safely from their browser, while also providing AI-curated hints when users get stuck.

It is specifically designed with a premium 3D-aesthetic frontend utilizing advanced glassmorphism and deep Z-axis CSS styling to provide a highly immersive user experience.

---

## 🎨 UI / UX & 3D Aesthetics

The platform is designed to look like a premium, modern developer tool. We abandoned flat styling in favor of deep volumetric CSS properties:

- **Glassmorphism:** The layout utilizes complex `backdrop-filter: blur()` properties mixed with directional `box-shadow` inset/outset gradients to make panels look like they are carved from solid glass.
- **Dynamic 3D Tilts:** Challenge cards compute your mouse X/Y coordinates in real-time. This translates into native CSS `transform: rotateX() rotateY()` equations that tilt the card naturally toward your cursor.
- **Deep Z-Axis Translation:** While the cards tilt, the internal elements (icons, text, badges) are pushed forward using `translateZ(30px)`, creating a physical parallax gap where the text literally floats off the card background.
- **Volumetric Lighting & Glare:** A custom radial-gradient layer tracks your mouse over the cards, simulating a glossy glass reflection shining under a moving light. Background orbs utilize stacked offset shadows to appear as glowing 3D spheres rather than flat colored circles.

![Challenges Preview](challenges.png)
*(Challenges Dashboard)*

![Editor Preview](Editor.png)
*(SQL Editor Execution Screen)*

---

## 🌟 Key Features
- **Isolated SQL Sandboxes:** Users execute real SQL queries within dynamically provisioned PostgreSQL schemas that immediately rollback after execution, keeping the primary database forever pristine.
- **AI-Powered Hints:** Integrated with Gemini AI to analyze the user's specific SQL query and schema structure to provide non-giveaway, educational hints.
- **Premium 3D Aesthetics:** Volumetric spherical backgrounds, dynamic mouse-tracking glare reflections, deep box-shadow glassmorphism, and responsive 3D card tilts built purely with native CSS.
- **Real-time Query Validation:** Pure backend comparison between the user's query results and the stored Expected Output matrix.
- **Progress Tracking:** Saves attempt history and query results securely to MongoDB.

---

## 🏗️ Technology Choices & Justification

To build a secure, real-time code-execution platform without needing massive Docker infrastructure, the architecture leans on a dual-database pattern separating our NoSQL "State" from our SQL "Execution".

| Technology | Role inside CipherSQLStudio | Why we chose it (Comparative Advantage) |
| :--- | :--- | :--- |
| **React (Vite)** | Frontend UI | **Why not Next.js?** We don't need SSR for a highly interactive, authenticated application state. Vite acts as a lightning-fast build tool, providing instant HMR for developing the complex 3D CSS effects comfortably. |
| **Express (Node.js)** | Backend Orchestrator | **Why not Python/Django?** V8 Javascript engines possess highly efficient asynchronous I/O event loops. Since the backend's primary job is proxying data between MongoDB, NeonDB, and Gemini concurrently, Node.js non-blocking architecture is ideal to prevent execution bottlenecking. |
| **MongoDB** | State & Metadata Datastore | **Why not store everything in PostgreSQL?** MongoDB is schemaless. Assignments require wildly different configurations of `sampleTables` (some need 1 table with 3 columns, others need 4 tables with 10 columns). Storing variable JSON `expectedOutput` graphs is deeply native to MongoDB's BSON document structure. |
| **NeonDB (PostgreSQL)** | Query Execution Engine | **Why not SQLite?** SQLite lacks advanced server-side features. NeonDB is Serverless Postgres. Because PostgreSQL supports **Transactional DDL**, we can `BEGIN` a transaction, create temporary tables, insert data, execute the user's query, and then safely `ROLLBACK` to keep the DB perfectly clean. MySQL cannot rollback table creation. |
| **SCSS (Sass)** | CSS Preprocessor | **Why not Tailwind?** Tailwind makes highly-specific 3D keyframes, deep `perspective()`, multi-layered `translateZ` layouts, and dynamic radial-gradients clunky. SCSS mixins and variables allow us to orchestrate a "premium" UI far easier. |

---

## 🚀 Local Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas Account
- NeonDB Account (PostgreSQL)

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/ciphersqlstudio.git
cd CipherSQLStudio
```

### 2. Environment Variables (.env)
Create a `.env` file in the `backend` directory. You will need the following secret keys:
```env
# MongoDB Connection String
MONGODB_URI=mongodb+srv://<user>:<pwd>@cluster...

# NeonDB Transaction pooler string 
DATABASE_URL=postgresql://<user>:<pwd>@ep-...neon.tech/neondb?sslmode=require

# Google Gemini API key for Hints
GEMINI_API_KEY=AI...

# Auth Secret signature
JWT_SECRET=your_super_secret_key_here

# API Port
PORT=5000
```

### 3. Install Dependencies
You need to install packages for both the backend and frontend.
```bash
# Install Backend
cd backend
npm install

# Install Frontend
cd ../frontend
npm install
```

### 4. Database Seeding
To populate MongoDB with the initial assignment data (the questions, sample tables, and expected output schemas), run the seeder script:
```bash
cd backend
npm run seed
```

### 5. Running the Application
Launch both development servers concurrently.
```bash
# Terminal 1:
cd backend
npm run dev
# Running on http://localhost:5000

# Terminal 2:
cd frontend
npm run dev
# Running on http://localhost:5173
```

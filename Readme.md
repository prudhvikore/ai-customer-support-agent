# AI Customer Support Agent

A **full-stack AI-powered customer support agent** project.

- **Frontend:** React (Javascript)
- **Backend:** Express.js, MongoDB, JWT, OpenRouter

---

## 🏗️ Tech Stack

- **Frontend**
  - React (Javascript)
  - React Router
  - Tailwind CSS
- **Backend**
  - Node.js (Express.js)
  - MongoDB Atlas
  - JWT authentication
  - bcrypt password hashing
  - OpenRouter AI integration
- **DevOps**
  - Docker & Docker Compose
  - Netlify (frontend deployment)
  - Render (backend deployment)

---

## 📁 Project Structure

```
.
├── client/                # React frontend
│   ├── public/
│   ├── src/
│   │   ├── api/           
│   │   ├── context/      
│   │   ├── components/    
│   │   ├── pages/         
│   │   ├── App.jsx
│   │   ├── config.js
│   │   ├── index.css
│   │   └── main.jsx
│   └── Dockerfile
│
├── server/                # Express backend
│   ├── src/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── config.js
│   │   ├── index.js
│   │   ├── logger.js
│   │   └── server.js
│   └── Dockerfile
│
├── docker-compose.yml
└── README.md

```

---

## 🌐 Frontend

### 🔑 Environment Variables

Create `client/.env`:

```env
VITE_API_BASE=http://localhost:3000
```

### ▶️ Running Frontend Locally

```sh
cd client
npm install
npm start      # Runs on http://localhost:5173 by default
```

## 💻 Frontend Usage

- Start locally with `npm start` in `client/`
- After login, you can:
  - Send chat messages (calls `/chat`)
  - Health check backend (`/`)

---

## 🛠️ Backend

### 🔑 Environment Variables

Create `src/.env`:

```env
PORT=3000
MONGO_URI=mongodb://mongo:27017/ai-support
JWT_SECRET=your_jwt_secret

# OpenRouter
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_API_BASE=https://openrouter.ai/v1
```

### ▶️ Running Backend Locally

```sh
cd src
npm install
npm run dev    # Starts with nodemon
npm start      # Production mode
```

---

## 🐳 Docker Usage

### Build & Run

```sh
docker-compose up --build
```

### Run Detached

```sh
docker-compose up -d
```

### Stop

```sh
docker-compose down
```

---

## 📡 API Endpoints (Backend)

### Health Check

- **GET /**  
  Response:  
  ```json
  { "ok": true }
  ```

### Authentication

- **POST /auth/register**  
  Request:  
  ```json
  { "name": "User", "email": "test@mail.com", "password": "123456" }
  ```
  Response:  
  ```json
  { "id": "user_id", "username": "User", "email": "test@mail.com" }
  ```

- **POST /auth/login**  
  Request:  
  ```json
  { "email": "test@mail.com", "password": "123456" }
  ```
  Response:  
  ```json
  { "token": "<jwt_token>" }
  ```

- **GET /auth/me**  
  Request:  
  ```json
  { "id": "user_id", "username": "User", "email": "test@mail.com" }
  ```
  Response:  
  ```json
  { "id": "user_id", "username": "User", "email": "test@mail.com" }
  ```

### Chat

- **POST /chat/send**  
  Headers: `Authorization: Bearer <jwt_token>`  
  Request:  
  ```json
  { "message": "Hello" }
  ```
  Response:  
  ```json
  { "reply": "AI generated response..." }
  ```

- **GET /chat/messages**  
  Headers: `Authorization: Bearer <jwt_token>`
  Request:  
  ```json
  { "userId": "User123" }
  ```
  Response:  
  ```json
  { "messages": "Returns chat history list...." }
  ```

- **GET /chat/conversations**  
  Headers: `Authorization: Bearer <jwt_token>`
  Request:  
  ```json
  { "userId": "User123" }
  ```
  Response:  
  ```json
  { "messages": "Returns chat history list...." }
  ```


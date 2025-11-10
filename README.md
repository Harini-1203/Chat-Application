# 💬 Real-Time Chat App (React Native + Node.js + Socket.IO)

A full-stack real-time chat application built with:
- **Frontend:** React Native  
- **Backend:** Node.js + Express.js + Socket.IO  
- **Database:** MongoDB  
- **Auth:** JWT (JSON Web Tokens)  
- **Realtime:** Socket.IO (typing, online/offline, message delivery/read)

---


## 🛠️ Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | React Native (Expo / React Navigation / AsyncStorage) |
| **Backend** | Node.js, Express.js |
| **Realtime** | Socket.IO |
| **Database** | MongoDB with Mongoose |
| **Auth** | JWT Tokens |
| **Deployment** | Can run locally or on any Node host (Render, Vercel, etc.) |

---

## ⚙️ Setup Instructions

### 1. Clone the repo
```bash
git clone https://github.com/yourusername/realtime-chat-app.git
cd realtime-chat-app
```
### 2. Backend Setup (Server)
```bash
cd server
npm install
```
#### Create a .env file in server/ folder:
```bash
PORT=5000
MONGO_URI=your_uri
JWT_SECRET=your_secret_key_here
```
#### Start the backend
```bash
npm run dev
```
### 3. Frontend Setup
```bash
cd client
npm install
```
#### Create a .env file inside client/:
```bash
API_URL=http://localhost:5000
```
#### Run the app:
if using Expo:
```bash
expo start
```

## Sample users
| Name  | Email               | Password |
| ----- | ------------------- | -------- |
| leemi | [leemi@example.com] | 123456   |
| ram   | [ram@example.com]   | 123456   |







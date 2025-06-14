# 💬 LinkMate - Real-Time Chat Application

LinkMate is a full-stack messaging web application built with the MERN stack (MongoDB, Express, React, Node.js) and enhanced with real-time communication using Socket.io. It supports one-on-one messaging, group chat, online status, and emoji support.

---

## 🚀 Features

- 🔒 User authentication (via Google Sign-In or signup/login)
- 👥 Friend requests and friend list management
- 💬 One-to-one real-time messaging
- 👨‍👩‍👧‍👦 Group chat with group message broadcasting
- 🟢 Online/offline presence indicator
- 😃 Emoji support
- 🔔 Message status tracking (unread/seen)

---

## 🛠️ Tech Stack

**Frontend:**
- React.js
- Axios
- Socket.io-client
- Material UI & CSS

**Backend:**
- Node.js
- Express.js
- MongoDB (Mongoose)
- Socket.io
- Multer (for file uploads)

---

## 📁 Project Structure
```bash
LinkMate/
├── backend/
│ ├── models/
│ ├── controllers/
│ ├── routes/
│ ├── uploads/ # media file uploads stored here
│ ├── app.js
│ └── mongodb.js
├── frontend/
│ ├── src/
│ │ ├── components/
│ │ ├── pages/
│ │ ├── context/
│ │ ├── App.js
│ │ └── index.js
└── README.md
```

## ⚙️ Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/your-username/linkmate.git
cd linkmate
```
### 2. Backend Setup
```bash
cd backend
npm install
```

- Make sure MongoDB is running locally.
- Create /uploads folder in backend/ directory:

```bash
mkdir uploads
```

- Run backend:
```bash
node app.js
```

### 3. Frontend Setup
```bash
cd frontend 
npm install
npm start
```
- App will start on http://localhost:3000

## Future Enhancements
- File sharing
- Video calling
- Notifications
- Typing indicators

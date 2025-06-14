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
## 🖼️ Images
![Screenshot_20250615_001737](https://github.com/user-attachments/assets/215f315c-f3be-46ee-9bd1-66902f3d9e0f)

![Screenshot_20250615_002213](https://github.com/user-attachments/assets/2da047ac-e23e-4018-92b5-02521c28bfa6)

![Screenshot_20250615_001845](https://github.com/user-attachments/assets/85c1777e-a60c-4893-8840-6d30e0b0348c)

![Screenshot_20250615_001938](https://github.com/user-attachments/assets/dda167b9-b4d0-4e35-9a1a-8cb7e0463095)

![Screenshot_20250615_002016](https://github.com/user-attachments/assets/d0b32c79-fa70-4f03-a646-86971c0bbea1)

![Screenshot_20250615_002149](https://github.com/user-attachments/assets/6f193dd9-1d8a-4dac-a56b-c683a85dd738)

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

## 🎯 Future Enhancements
- File sharing
- Video calling
- Notifications
- Typing indicators

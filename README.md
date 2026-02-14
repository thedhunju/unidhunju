# UNI-find: C2C Prototype for Kathmandu University

**UNI-find** is a consumer-to-consumer (C2C) marketplace platform designed specifically for students at Kathmandu University. It allows students to trade, sell, and buy items within a trusted community.

## 🚀 Key Features

- **🎓 Verified Authentication**: Restricted to `@ku.edu.np` and `@student.ku.edu.np` domains.
- **🛒 C2C Marketplace**: Any student can list items or purchase from peers.
- **🏷️ Smart Category Browsing**: Quickly navigate through Books, Electronics, Stationery, and more.
- **💰 Buy Now**: Simplified purchase flow with immediate status updates (marks items as "Sold").
- **👤 Profile Management**: Customizable profiles with names and profile pictures that persist.
- **🔑 Secure Password Reset**: OTP-based verification system integrated with email services.
- **🔍 Advanced Search & Filters**: Search for specific items and filter by category or price range.
- **🔔 Real-time Notifications**: Integrated Toast notifications and a notification dropdown for status updates.

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Lucide Icons.
- **Backend**: Node.js, Express.js.
- **Database**: MySQL.
- **Authentication**: JWT (JSON Web Tokens) & Bcrypt for password hashing.
- **File Handling**: Multer for image uploads.
- **Emails**: Nodemailer for OTP delivery.

## ⚙️ Setup & Installation

### 1. Prerequisites
- Node.js installed.
- MySQL server running.

### 2. Database Setup
1. Create a database named `unifindc2c` (or as per your `.env`).
2. Import the schema from `database.sql`:
   ```bash
   mysql -u root -p database_name < database.sql
   ```

### 3. Integrated Setup (Recommended)
You can run both the backend and frontend simultaneously from the root directory.

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Configure Environment**: Create a `.env` file in the root directory.
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=unifindc2c
   JWT_SECRET=your_secret_key
   PORT=3000
   EMAIL_USER=your_gmail@gmail.com
   EMAIL_PASS=your_gmail_app_password
   ```
3. **Start Development Servers**:
   ```bash
   npm run dev
   ```
   *This command uses `concurrently` to start the backend server (on port 3000) and the frontend Vite server.*

### 4. Alternative Manual Setup
- **Backend**: `npm run server` (runs nodemon)
- **Frontend**: `cd client && npm install && npm run dev`

## 🤝 Contributing
This is a prototype developed for Kathmandu University students. Feedback and contributions are welcome!

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

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Lucide Icons.
- **Backend**: Node.js, Express.js.
- **Database**: MySQL.
- **Authentication**: JWT (JSON Web Tokens) & Bcrypt for password hashing.
- **File Handling**: Multer for image uploads.
- **Emails**: Nodemailer for OTP delivery.

## ⚙️ Setup & Installation

### 1. Prerequisite
- Node.js installed.
- MySQL server running with a database named `unifind_db`.

### 2. Backend Setup
1. Open the root directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your environment: Create a `.env` file based on `.env.sample`.
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=unifind_db
   JWT_SECRET=your_secret_key
   EMAIL_USER=your_gmail@gmail.com
   EMAIL_PASS=your_gmail_app_password
   ```
4. Start the server:
   ```bash
   node server.js
   ```

### 3. Frontend Setup
1. Navigate to the `client` directory: `cd client`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## 🤝 Contributing
This is a prototype developed for Kathmandu University students. Feedback and contributions are welcome!

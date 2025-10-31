# Encryption Application

A full-stack web application for secure file encryption and decryption with user authentication.

## Features

- User Authentication (Register/Login)
- File Encryption/Decryption
- Multiple Encryption Algorithms Support
- File Upload and Download
- Encryption History Tracking
- Secure File Storage
- Protected Routes

## Project Structure

```
├── backend/
│   ├── middleware/     # Authentication and upload middlewares
│   ├── models/        # Database models
│   ├── routes/        # API endpoints
│   ├── scripts/       # Database seeding scripts
│   ├── uploads/       # Temporary file storage
│   └── server.js      # Main server file
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── context/     # React context providers
│   │   └── assets/      # Static assets
│   └── public/        # Public assets
```

## Technology Stack

### Backend
- Node.js
- Express.js
- MongoDB (with Mongoose)
- JWT Authentication
- Crypto Module for Encryption

### Frontend
- React
- Vite
- Context API for State Management
- React Router for Navigation
- Modern CSS

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   # Backend
   cd backend
   npm install

   # Frontend
   cd frontend
   npm install
   ```

3. Set up environment variables:
   - Create `.env` file in backend directory
   - Configure MongoDB connection
   - Set JWT secret key

4. Start the application:
   ```bash
   # Backend
   cd backend
   npm start

   # Frontend
   cd frontend
   npm run dev
   ```

## Security Features

- JWT based authentication
- Password hashing
- Secure file storage
- Protected API endpoints
- Encryption key management

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

MIT License - Feel free to use and modify this project for your needs.
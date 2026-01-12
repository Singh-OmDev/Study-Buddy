import app from './src/app.js';
import connectDB from './src/config/db.js';
import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 5000;
console.log("Server key (masked):", process.env.CLERK_SECRET_KEY ? process.env.CLERK_SECRET_KEY.slice(0, 10) + "..." : "MISSING");
console.log("Publishable key (masked):", process.env.CLERK_PUBLISHABLE_KEY ? process.env.CLERK_PUBLISHABLE_KEY.slice(0, 10) + "..." : "MISSING");

// Connect to Database
connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

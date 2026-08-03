const app = require('./src/app');
const { connectDB } = require('./src/config/db');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

// Initialize Database connection
connectDB().then(() => {
  // Start Express server listening
  app.listen(PORT, () => {
    console.log(`Crimson Bulk Email Sender server is running on http://localhost:${PORT}`);
  });
});

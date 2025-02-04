const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 8080; // Use port 8080 for Amplify

// Serve login.html as the default page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

// Serve other static files (CSS, JS, images) from the root directory
app.use(express.static(__dirname));

// Start the server
// app.listen(port, () => {
//   console.log(`Server running on port ${port}`);
// });

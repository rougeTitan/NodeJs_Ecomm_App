// Import Node.js path module
const path = require('path');

// Export the directory path of the main application file (app.js)
// This utility helps other modules get the root directory of the application
module.exports = path.dirname(process.mainModule.filename);
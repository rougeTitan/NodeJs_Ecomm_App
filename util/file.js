// Import Node.js file system module
const fs = require('fs');

// Utility function to delete a file from the file system
const deleteFile = (filePath) => {
    // Use fs.unlink to delete the file asynchronously
    fs.unlink(filePath, (err) => {
        if (err) {
            throw (err); // Throw error if file deletion fails
        }
    });
}

// Export the deleteFile function for use in other modules
exports.deleteFile = deleteFile;
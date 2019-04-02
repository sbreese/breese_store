const fs = require('fs');

const deleteFile = (filePath) => {
    fs.unlink(filePath, (err) => {
        if (err) {
            // throw (err); <-- Throws error when file is already gone.  We can ignore instead.
            console.log("Error deleting file: ", err);
        }
    });
}

exports.deleteFile = deleteFile;
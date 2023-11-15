const multer=require('multer')
const path=require('path')


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'public', 'uploads'))
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 }, // Set your file size limit
    fileFilter: (req, file, cb) => {
        // Add your file filter logic here
        // Example: Check file types or other conditions
        cb(null, true);
    }
});


module.exports = upload;

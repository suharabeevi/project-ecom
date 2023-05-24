const multer = require('multer')

const addBanner = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/productImages')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
});

module.exports = {  
    addBannerupload: multer({ storage: addBanner }).single('image'),
}
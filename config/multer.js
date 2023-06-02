const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// configuration
cloudinary.config({
    cloud_name: 'dpgbodkae',
    api_key:  '837559588176451',
    api_secret: 'UI-Au4C2aw4ZtCoGrSWC2RkGG90'
});

// upload
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'ecommerce-products',
        allowedFormats: ['jpg', 'jpeg', 'png','webp'],
        public_id: (req, file) => {
            // remove the file extension from the file name
            const fileName = file.originalname.split('.').slice(0, -1).join('.');
            return fileName+new Date();
        },
    },
});
const upload = multer({ storage: storage }).array('Image', 10);
module.exports = upload;


const multer  = require('multer');
const path    = require('path');

const ALLOWED_EXTENSIONS = /\.(jpg|jpeg|jfif|jpe|png|webp|gif|avif|heic|heif|bmp|tiff|tif|svg)$/i;
const ALLOWED_MIMETYPES  = [
  'image/jpeg','image/jpg','image/jfif','image/pjpeg','image/png','image/webp',
  'image/gif','image/avif','image/heic','image/heif','image/bmp','image/tiff','image/svg+xml',
  'application/octet-stream',
];

const fileFilter = (req, file, cb) => {
  const extOk  = ALLOWED_EXTENSIONS.test(path.extname(file.originalname));
  const mimeOk = ALLOWED_MIMETYPES.includes(file.mimetype);
  if (extOk || mimeOk) cb(null, true);
  else cb(new Error('Unsupported file type. Upload an image file.'));
};

const useCloudinary = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY    &&
  process.env.CLOUDINARY_API_SECRET
);

let storage;

if (useCloudinary) {
  const cloudinary = require('cloudinary').v2;
  const { CloudinaryStorage } = require('multer-storage-cloudinary');

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => ({
      folder:          'fabulous-and-more/products',
      allowed_formats: ['jpg','jpeg','png','webp','gif','avif','heic','heif','bmp','tiff','svg'],
      transformation:  [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto:good', fetch_format: 'auto' }],
      public_id:       `${Date.now()}-${file.originalname.replace(/\s+/g,'-').replace(/[^a-zA-Z0-9.\-_]/g,'').replace(/\.[^/.]+$/,'')}`,
    }),
  });

  console.log('✅ Upload storage: Cloudinary');
} else {
  const fs = require('fs');
  if (!fs.existsSync('uploads')) fs.mkdirSync('uploads', { recursive: true });

  storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
      const JPEG_VARIANTS = ['.jfif','.jpe','.jif','.pjpeg','.pjp'];
      let ext = path.extname(file.originalname).toLowerCase();
      if (JPEG_VARIANTS.includes(ext)) ext = '.jpg';
      const base = path.basename(file.originalname, path.extname(file.originalname))
        .replace(/\s+/g,'-').replace(/[^a-zA-Z0-9\-_]/g,'');
      cb(null, `${Date.now()}-${base}${ext}`);
    },
  });

  console.log('⚠️  Upload: Local disk (add Cloudinary env vars for production)');
}

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 }, fileFilter });

module.exports = upload;
module.exports.useCloudinary = useCloudinary;
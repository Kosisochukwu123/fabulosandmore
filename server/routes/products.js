const express  = require('express');
const router   = express.Router();
const upload   = require('../middleware/upload');
const { protect, authorize } = require('../middleware/auth');
const {
  getProducts, getProduct, createProduct, updateProduct,
  deleteProduct, addReview, getLowStockProducts, getCategories,
} = require('../controllers/productController');

router.get('/',           getProducts);
router.get('/categories', getCategories);
router.get('/low-stock',  protect, authorize('admin', 'warehouse'), getLowStockProducts);
router.get('/:id',        getProduct);

/* POST — accepts both JSON body (no images) and multipart (with images) */
router.post(
  '/',
  protect,
  authorize('admin'),
  upload.array('images', 5),
  createProduct
);

/* PUT — accepts JSON body or multipart for image uploads */
router.put(
  '/:id',
  protect,
  authorize('admin'),
  upload.array('images', 5),
  updateProduct
);

/* PUT for image-only upload endpoint used by ImageUploader component */
router.put(
  '/:id/images',
  protect,
  authorize('admin'),
  upload.array('images', 10),
  updateProduct
);

router.delete('/:id',        protect, authorize('admin'), deleteProduct);
router.post('/:id/reviews',  protect, addReview);

module.exports = router;
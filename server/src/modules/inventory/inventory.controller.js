import Product from '../products/product.model.js';
import InventoryTransaction from './inventoryTransaction.model.js';
import { deleteCache } from '../../config/redis.js';
import { BadRequestError, NotFoundError } from '../../utils/errors.js';
import { sendSuccess } from '../../utils/response.js';

export const adjustInventory = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { transactionType, quantity, notes } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return next(new NotFoundError('Product not found'));
    }

    let stockChange = 0;
    
    if (transactionType === 'IN') {
      if (quantity <= 0) {
        return next(new BadRequestError('Restock quantity must be positive'));
      }
      stockChange = quantity;
    } else if (transactionType === 'OUT') {
      if (quantity <= 0) {
        return next(new BadRequestError('Disbursement quantity must be positive'));
      }
      if (product.inventoryQuantity < quantity) {
        return next(new BadRequestError('Insufficient stock for this disbursement'));
      }
      stockChange = -quantity;
    } else if (transactionType === 'ADJUSTMENT') {
      // Adjustment can be negative (reducing) or positive (adding)
      stockChange = quantity;
      if (product.inventoryQuantity + stockChange < 0) {
        return next(new BadRequestError('Adjustment would result in negative inventory quantity'));
      }
    }

    // Apply atomic updates
    product.inventoryQuantity += stockChange;
    await product.save();

    // Log the transaction
    const transaction = await InventoryTransaction.create({
      productId,
      transactionType,
      quantity: stockChange,
      notes: notes || `Manual stock update: ${transactionType}`,
    });

    // Invalidate product cache
    await deleteCache('products:*');
    await deleteCache(`product:${productId}`);

    return sendSuccess(res, 200, 'Inventory adjusted successfully', {
      product: {
        id: product._id,
        name: product.name,
        sku: product.sku,
        inventoryQuantity: product.inventoryQuantity,
      },
      transaction,
    });
  } catch (error) {
    next(error);
  }
};

export const getTransactions = async (req, res, next) => {
  try {
    const { productId } = req.query;
    const query = {};
    
    if (productId) {
      query.productId = productId;
    }

    const transactions = await InventoryTransaction.find(query)
      .populate('productId', 'name sku baseUnit')
      .sort({ createdAt: -1 })
      .limit(100); // return last 100 entries

    return sendSuccess(res, 200, 'Inventory transactions retrieved successfully', transactions);
  } catch (error) {
    next(error);
  }
};

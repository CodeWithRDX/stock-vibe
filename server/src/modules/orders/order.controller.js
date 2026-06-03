import Order from './order.model.js';
import Quotation from '../quotations/quotation.model.js';
import Product from '../products/product.model.js';
import InventoryTransaction from '../inventory/inventoryTransaction.model.js';
import { isUnitCompatible, calculatePricing } from '../../utils/unitConverter.js';
import { deleteCache } from '../../config/redis.js';
import { BadRequestError, NotFoundError, ForbiddenError } from '../../utils/errors.js';
import { sendSuccess } from '../../utils/response.js';

export const createOrder = async (req, res, next) => {
  try {
    const { items, quotationId } = req.body;
    
    let orderItems = [];
    let totalAmount = 0;
    let quotationObj = null;

    // Option A: Create from Quotation
    if (quotationId) {
      quotationObj = await Quotation.findById(quotationId);
      if (!quotationObj) {
        return next(new NotFoundError('Quotation not found'));
      }
      if (req.user.role !== 'Admin' && quotationObj.userId.toString() !== req.user._id.toString()) {
        return next(new ForbiddenError('You do not own this quotation'));
      }
      if (quotationObj.status !== 'Pending') {
        return next(new BadRequestError(`Quotation already processed with status: ${quotationObj.status}`));
      }

      // Load items from quotation
      for (const qItem of quotationObj.items) {
        const product = await Product.findById(qItem.productId);
        if (!product || !product.active) {
          return next(new BadRequestError(`Product in quotation is no longer available or active: ${qItem.productId}`));
        }

        // Verify stock
        if (product.inventoryQuantity < qItem.baseQuantity) {
          return next(new BadRequestError(`Insufficient stock for product ${product.name}. Required: ${qItem.quantity}${qItem.unit}, Available: ${product.inventoryQuantity} ${product.baseUnit}`));
        }

        orderItems.push({
          productId: qItem.productId,
          quantity: qItem.quantity,
          unit: qItem.unit,
          baseQuantity: qItem.baseQuantity,
          pricePerUnit: qItem.pricePerUnit,
          subtotal: qItem.subtotal,
        });
      }
      totalAmount = quotationObj.totalAmount;
    } 
    // Option B: Create directly from item list
    else if (items && items.length > 0) {
      for (const item of items) {
        const { productId, quantity, unit } = item;
        const product = await Product.findById(productId);
        if (!product || !product.active) {
          return next(new NotFoundError(`Product not found or inactive: ${productId}`));
        }

        if (!isUnitCompatible(unit, product.baseUnit)) {
          return next(new BadRequestError(`Unit ${unit} is incompatible with base unit ${product.baseUnit} for product ${product.name}`));
        }

        const pricing = calculatePricing(quantity, unit, product.basePrice);

        // Verify stock
        if (product.inventoryQuantity < pricing.baseQuantity) {
          return next(new BadRequestError(`Insufficient stock for product ${product.name}. Required: ${quantity}${unit}, Available: ${product.inventoryQuantity} ${product.baseUnit}`));
        }

        orderItems.push({
          productId,
          quantity,
          unit,
          baseQuantity: pricing.baseQuantity,
          pricePerUnit: pricing.pricePerUnit,
          subtotal: pricing.subtotal,
        });

        totalAmount += pricing.subtotal;
      }
    } else {
      return next(new BadRequestError('Please provide items list or quotationId to place an order'));
    }

    // Deduct stock and log transaction logs
    for (const item of orderItems) {
      const product = await Product.findById(item.productId);
      product.inventoryQuantity -= item.baseQuantity;
      await product.save();

      await InventoryTransaction.create({
        productId: item.productId,
        transactionType: 'OUT',
        quantity: -item.baseQuantity,
        notes: `Order fulfillment stock deduction`,
      });
    }

    // Generate unique Order Number
    const timestamp = Date.now().toString().slice(-6);
    const rand = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ORD-${timestamp}-${rand}`;

    const order = await Order.create({
      orderNumber,
      userId: req.user._id,
      items: orderItems,
      totalAmount: Math.round(totalAmount * 100) / 100,
      status: 'Pending',
    });

    // Update quotation status if relevant
    if (quotationObj) {
      quotationObj.status = 'Approved';
      await quotationObj.save();
    }

    // Invalidate product caches since stock levels changed
    await deleteCache('products:*');
    for (const item of orderItems) {
      await deleteCache(`product:${item.productId}`);
    }

    return sendSuccess(res, 201, 'Order placed successfully', order);
  } catch (error) {
    next(error);
  }
};

export const getAllOrders = async (req, res, next) => {
  try {
    const query = {};

    // Sellers only see their own orders
    if (req.user.role !== 'Admin') {
      query.userId = req.user._id;
    }

    const { page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('userId', 'name email')
        .populate('items.productId', 'name sku baseUnit')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Order.countDocuments(query),
    ]);

    const result = {
      orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
      },
    };

    return sendSuccess(res, 200, 'Orders retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate('userId', 'name email')
      .populate('items.productId', 'name sku baseUnit basePrice');

    if (!order) {
      return next(new NotFoundError('Order not found'));
    }

    // Auth check
    if (req.user.role !== 'Admin' && order.userId._id.toString() !== req.user._id.toString()) {
      return next(new ForbiddenError('You do not have access to this order'));
    }

    return sendSuccess(res, 200, 'Order retrieved successfully', order);
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return next(new NotFoundError('Order not found'));
    }

    const oldStatus = order.status;
    
    if (oldStatus === 'Cancelled') {
      return next(new BadRequestError('Cannot change status of a cancelled order'));
    }

    if (oldStatus === 'Delivered' && status === 'Cancelled') {
      return next(new BadRequestError('Cannot cancel a delivered order'));
    }

    order.status = status;
    await order.save();

    // If order was cancelled, return items back to inventory stock
    if (status === 'Cancelled' && oldStatus !== 'Cancelled') {
      for (const item of order.items) {
        const product = await Product.findById(item.productId);
        if (product) {
          product.inventoryQuantity += item.baseQuantity;
          await product.save();

          await InventoryTransaction.create({
            productId: item.productId,
            transactionType: 'IN',
            quantity: item.baseQuantity,
            notes: `Restocking from Order Cancelled: ${order.orderNumber}`,
          });

          await deleteCache(`product:${item.productId}`);
        }
      }
      await deleteCache('products:*');
    }

    return sendSuccess(res, 200, `Order status updated to ${status}`, order);
  } catch (error) {
    next(error);
  }
};

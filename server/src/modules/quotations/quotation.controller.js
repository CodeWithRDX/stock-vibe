import Quotation from './quotation.model.js';
import Product from '../products/product.model.js';
import { isUnitCompatible, calculatePricing } from '../../utils/unitConverter.js';
import { BadRequestError, NotFoundError, ForbiddenError } from '../../utils/errors.js';
import { sendSuccess } from '../../utils/response.js';

export const createQuotation = async (req, res, next) => {
  try {
    const { items } = req.body;
    
    let totalAmount = 0;
    const quotationItems = [];

    for (const item of items) {
      const { productId, quantity, unit } = item;
      
      const product = await Product.findById(productId);
      if (!product || !product.active) {
        return next(new NotFoundError(`Product not found or inactive: ${productId}`));
      }

      if (!isUnitCompatible(unit, product.baseUnit)) {
        return next(new BadRequestError(`Unit ${unit} is incompatible with product base unit ${product.baseUnit} for: ${product.name}`));
      }

      const pricing = calculatePricing(quantity, unit, product.basePrice);

      quotationItems.push({
        productId,
        quantity,
        unit,
        baseQuantity: pricing.baseQuantity,
        pricePerUnit: pricing.pricePerUnit,
        subtotal: pricing.subtotal,
      });

      totalAmount += pricing.subtotal;
    }

    // Generate unique Quotation Number
    const timestamp = Date.now().toString().slice(-6);
    const rand = Math.floor(1000 + Math.random() * 9000);
    const quotationNumber = `QT-${timestamp}-${rand}`;

    const quotation = await Quotation.create({
      quotationNumber,
      userId: req.user._id,
      items: quotationItems,
      totalAmount: Math.round(totalAmount * 100) / 100,
      status: 'Pending',
    });

    return sendSuccess(res, 201, 'Quotation created successfully', quotation);
  } catch (error) {
    next(error);
  }
};

export const getAllQuotations = async (req, res, next) => {
  try {
    const query = {};
    
    // Sellers only see their own quotations
    if (req.user.role !== 'Admin') {
      query.userId = req.user._id;
    }

    const { page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [quotations, total] = await Promise.all([
      Quotation.find(query)
        .populate('userId', 'name email')
        .populate('items.productId', 'name sku baseUnit')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Quotation.countDocuments(query),
    ]);

    const result = {
      quotations,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
      },
    };

    return sendSuccess(res, 200, 'Quotations retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

export const getQuotationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const quotation = await Quotation.findById(id)
      .populate('userId', 'name email')
      .populate('items.productId', 'name sku baseUnit basePrice');
      
    if (!quotation) {
      return next(new NotFoundError('Quotation not found'));
    }

    // Auth check
    if (req.user.role !== 'Admin' && quotation.userId._id.toString() !== req.user._id.toString()) {
      return next(new ForbiddenError('You do not have access to this quotation'));
    }

    return sendSuccess(res, 200, 'Quotation retrieved successfully', quotation);
  } catch (error) {
    next(error);
  }
};

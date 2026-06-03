import Product from './product.model.js';
import Category from './category.model.js';
import { getCache, setCache, deleteCache } from '../../config/redis.js';
import { NotFoundError } from '../../utils/errors.js';
import { sendSuccess } from '../../utils/response.js';

// --- Categories ---

export const createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const category = await Category.create({ name, description });
    
    // Clear product caches since category lists might change
    await deleteCache('products:*');
    
    return sendSuccess(res, 201, 'Category created successfully', category);
  } catch (error) {
    next(error);
  }
};

export const getAllCategories = async (req, res, next) => {
  try {
    const cacheKey = 'categories:all';
    const cachedCategories = await getCache(cacheKey);
    if (cachedCategories) {
      return sendSuccess(res, 200, 'Categories retrieved from cache', cachedCategories);
    }

    const categories = await Category.find().sort({ name: 1 });
    await setCache(cacheKey, categories, 3600); // Cache for 1 hour

    return sendSuccess(res, 200, 'Categories retrieved successfully', categories);
  } catch (error) {
    next(error);
  }
};

// --- Products ---

export const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    
    // Invalidate product caches
    await deleteCache('products:*');
    
    return sendSuccess(res, 201, 'Product created successfully', product);
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return next(new NotFoundError('Product not found'));
    }

    // Invalidate product caches
    await deleteCache('products:*');
    await deleteCache(`product:${id}`);

    return sendSuccess(res, 200, 'Product updated successfully', product);
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cacheKey = `product:${id}`;
    
    const cachedProduct = await getCache(cacheKey);
    if (cachedProduct) {
      return sendSuccess(res, 200, 'Product retrieved from cache', cachedProduct);
    }

    const product = await Product.findById(id).populate('categoryId', 'name');
    if (!product) {
      return next(new NotFoundError('Product not found'));
    }

    await setCache(cacheKey, product, 600); // Cache for 10 mins

    return sendSuccess(res, 200, 'Product retrieved successfully', product);
  } catch (error) {
    next(error);
  }
};

export const getAllProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      categoryId = '',
      unitType = '', // 'g' / 'mL' / 'item'
      minPrice,
      maxPrice,
      sortBy = 'newest', // 'price', 'name', 'newest'
      sortOrder = 'desc',
    } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    
    // Construct cache key based on query filters
    const cacheKey = `products:page=${pageNum}:limit=${limitNum}:search=${search}:cat=${categoryId}:unit=${unitType}:min=${minPrice}:max=${maxPrice}:sort=${sortBy}:${sortOrder}:role=${req.user ? req.user.role : 'Public'}`;
    
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      return sendSuccess(res, 200, 'Products retrieved from cache', cachedData);
    }

    // Query builder
    const query = {};

    // For public users or sellers, retrieve only active products
    if (!req.user || req.user.role !== 'Admin') {
      query.active = true;
    }

    // Search query (SKU or Name substring match)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
      ];
    }

    if (categoryId) {
      query.categoryId = categoryId;
    }

    if (unitType) {
      query.baseUnit = unitType;
    }

    if (minPrice || maxPrice) {
      query.basePrice = {};
      if (minPrice) query.basePrice.$gte = parseFloat(minPrice);
      if (maxPrice) query.basePrice.$lte = parseFloat(maxPrice);
    }

    // Sort mapping
    let sortOptions = {};
    const direction = sortOrder === 'asc' ? 1 : -1;
    
    if (sortBy === 'price') {
      sortOptions.basePrice = direction;
    } else if (sortBy === 'name') {
      sortOptions.name = direction;
    } else {
      // Default newest
      sortOptions.createdAt = direction;
    }

    // Execute paginated queries
    const skip = (pageNum - 1) * limitNum;
    
    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('categoryId', 'name')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum),
      Product.countDocuments(query),
    ]);

    const result = {
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
      },
    };

    // Cache the output for 5 mins
    await setCache(cacheKey, result, 300);

    return sendSuccess(res, 200, 'Products retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

import { z } from 'zod';

// Auth Validation
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['Admin', 'Seller']).default('Seller'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Product & Category Validation
export const createCategorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters'),
  description: z.string().optional(),
});

export const createProductSchema = z.object({
  sku: z.string().min(3, 'SKU must be at least 3 characters'),
  name: z.string().min(2, 'Product name must be at least 2 characters'),
  description: z.string().optional(),
  categoryId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid category ID format'),
  baseUnit: z.enum(['mg', 'mL', 'item']),
  basePrice: z.number().nonnegative('Base price must be 0 or greater'),
  inventoryQuantity: z.number().nonnegative('Inventory quantity must be 0 or greater').default(0),
});

export const updateProductSchema = createProductSchema.partial();

// Inventory Validation
export const adjustInventorySchema = z.object({
  transactionType: z.enum(['IN', 'OUT', 'ADJUSTMENT']),
  quantity: z.number(), // Can be negative for adjustment/out
  notes: z.string().optional(),
});

// Quotation & Order Validation
const itemSchema = z.object({
  productId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID format'),
  quantity: z.number().positive('Quantity must be greater than 0'),
  unit: z.enum(['mg', 'g', 'kg', 'mL', 'L', 'item', 'strip', 'box']),
});

export const createQuotationSchema = z.object({
  items: z.array(itemSchema).nonempty('At least one item is required'),
});

export const createOrderSchema = z.object({
  items: z.array(itemSchema).nonempty('At least one item is required'),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']),
});

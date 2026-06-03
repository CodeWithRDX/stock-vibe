import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    baseUnit: {
      type: String,
      required: [true, 'Base unit is required'],
      enum: ['mg', 'mL', 'item'],
    },
    basePrice: {
      type: Number,
      required: [true, 'Base price is required'],
      min: [0, 'Base price cannot be negative'],
    },
    inventoryQuantity: {
      type: Number,
      required: [true, 'Inventory quantity is required'],
      default: 0,
      min: [0, 'Inventory quantity cannot be negative'],
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster search & filter
productSchema.index({ name: 'text', sku: 'text', description: 'text' });
productSchema.index({ categoryId: 1 });
productSchema.index({ active: 1 });

const Product = mongoose.model('Product', productSchema);

export default Product;

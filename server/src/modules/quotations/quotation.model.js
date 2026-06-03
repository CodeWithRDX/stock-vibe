import mongoose from 'mongoose';

const quotationItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [0.001, 'Quantity must be greater than zero'],
  },
  unit: {
    type: String,
    required: true,
    enum: ['g', 'kg', 'mL', 'L', 'item'],
  },
  baseQuantity: {
    type: Number,
    required: true, // Converted internal base unit amount
  },
  pricePerUnit: {
    type: Number,
    required: true, // Custom unit price calculated by pricing engine
  },
  subtotal: {
    type: Number,
    required: true,
  },
});

const quotationSchema = new mongoose.Schema(
  {
    quotationNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [quotationItemSchema],
    totalAmount: {
      type: Number,
      required: true,
      min: [0, 'Total amount cannot be negative'],
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Expired'],
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

quotationSchema.index({ userId: 1 });
quotationSchema.index({ status: 1 });

const Quotation = mongoose.model('Quotation', quotationSchema);

export default Quotation;

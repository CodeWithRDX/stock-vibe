import mongoose from 'mongoose';

const inventoryTransactionSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required'],
    },
    transactionType: {
      type: String,
      required: [true, 'Transaction type is required'],
      enum: ['IN', 'OUT', 'ADJUSTMENT'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      // Positive for additions (IN), negative or positive for adjustments, negative for OUT
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

inventoryTransactionSchema.index({ productId: 1 });
inventoryTransactionSchema.index({ createdAt: -1 });

const InventoryTransaction = mongoose.model('InventoryTransaction', inventoryTransactionSchema);

export default InventoryTransaction;

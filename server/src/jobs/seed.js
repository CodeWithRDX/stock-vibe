import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../modules/users/user.model.js';
import Category from '../modules/products/category.model.js';
import Product from '../modules/products/product.model.js';
import InventoryTransaction from '../modules/inventory/inventoryTransaction.model.js';
import Quotation from '../modules/quotations/quotation.model.js';
import Order from '../modules/orders/order.model.js';

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/inventory_db';

const seedDatabase = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(mongoURI);
    console.log('DB connected. Dropping existing collections to reset data...');
    
    // Clean slate
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await InventoryTransaction.deleteMany({});
    await Quotation.deleteMany({});
    await Order.deleteMany({});

    console.log('Collections cleared.');

    // 1. Seed Users
    console.log('Seeding Users...');
    const adminUser = await User.create({
      name: 'Global Administrator',
      email: 'admin@example.com',
      passwordHash: 'Password@123', // Will be hashed automatically
      role: 'Admin',
    });

    const sellerUser = await User.create({
      name: 'Main Seller User',
      email: 'seller@example.com',
      passwordHash: 'Password@123', // Will be hashed automatically
      role: 'Seller',
    });

    console.log(`Users seeded. Admin: ${adminUser.email}, Seller: ${sellerUser.email}`);

    // 2. Seed Categories
    console.log('Seeding Categories...');
    const categoriesList = [
      { name: 'Analgesics', description: 'Pain relief and fever reducers' },
      { name: 'Antibiotics', description: 'Bacterial infection treatment formulations' },
      { name: 'Supplements', description: 'Vitamins, nutrients, and healthcare supplements' },
      { name: 'Medical Supplies', description: 'Examination gloves, face masks, syringes, and clinical tools' },
    ];
    
    const seededCategories = await Category.insertMany(categoriesList);
    console.log(`Seeded ${seededCategories.length} categories.`);

    // Helper map
    const catMap = {};
    seededCategories.forEach((cat) => {
      catMap[cat.name] = cat._id;
    });

    // 3. Seed Medico Products (mg for weight, mL for volume, items for count)
    console.log('Seeding Medico Products...');
    const productsList = [
      {
        sku: 'MED-PARA-500',
        name: 'Paracetamol 500mg',
        description: 'Pain relief and temperature control tablets. Standard tablet contains 500mg.',
        categoryId: catMap['Analgesics'],
        baseUnit: 'mg',
        basePrice: 0.004, // ₹0.004 per mg. 500mg tablet = ₹2.00. Strip of 10 = ₹20.00
        inventoryQuantity: 200000, // 200,000 mg = 400 tablets worth
        active: true,
      },
      {
        sku: 'MED-AMOX-250',
        name: 'Amoxicillin 250mg',
        description: 'Broad-spectrum penicillin antibiotic capsules. Standard capsule contains 250mg.',
        categoryId: catMap['Antibiotics'],
        baseUnit: 'mg',
        basePrice: 0.012, // ₹0.012 per mg. 250mg capsule = ₹3.00. Strip of 10 = ₹30.00
        inventoryQuantity: 150000, // 150,000 mg = 600 capsules worth
        active: true,
      },
      {
        sku: 'MED-COUG-SYR',
        name: 'Dextromethorphan Cough Syrup',
        description: 'Oral dry cough relief liquid solution, 100mL bottle format.',
        categoryId: catMap['Analgesics'],
        baseUnit: 'mL',
        basePrice: 0.80, // ₹0.80 per mL. 100mL bottle = ₹80.00
        inventoryQuantity: 10000, // 10,000 mL = 100 bottles worth
        active: true,
      },
      {
        sku: 'MED-INSU-VIA',
        name: 'Insulin Injection Vial (10mL)',
        description: 'Fast-acting human insulin vial solution (100 IU/mL). Standard vial size 10mL.',
        categoryId: catMap['Supplements'],
        baseUnit: 'mL',
        basePrice: 40.00, // ₹40.00 per mL. 10mL vial = ₹400.00
        inventoryQuantity: 800, // 800 mL = 80 vials worth
        active: true,
      },
      {
        sku: 'MED-VITC-TAB',
        name: 'Vitamin C Chewable Tablets',
        description: '500mg ascorbic acid chewable tablets to boost immunity.',
        categoryId: catMap['Supplements'],
        baseUnit: 'item',
        basePrice: 1.50, // ₹1.50 per single tablet. Strip of 10 = ₹15.00
        inventoryQuantity: 5000, // 5,000 tablets
        active: true,
      },
      {
        sku: 'MED-GLOV-NIT',
        name: 'Surgical Nitrile Gloves',
        description: 'Powder-free sterile nitrile examination medical gloves.',
        categoryId: catMap['Medical Supplies'],
        baseUnit: 'item',
        basePrice: 6.00, // ₹6.00 per single glove. Box of 100 = ₹600.00
        inventoryQuantity: 3000, // 3,000 gloves
        active: true,
      },
    ];

    const seededProducts = await Product.insertMany(productsList);
    console.log(`Seeded ${seededProducts.length} products.`);

    // 4. Create Initial Inventory Transaction Logs for tracking audit
    console.log('Seeding initial inventory transaction records...');
    for (const prod of seededProducts) {
      await InventoryTransaction.create({
        productId: prod._id,
        transactionType: 'IN',
        quantity: prod.inventoryQuantity,
        notes: 'Initial medico stock load during system bootstrap',
      });
    }
    console.log('Inventory transaction logs seeded.');
    
    console.log('Database seeding successfully finished!');
    process.exit(0);
  } catch (error) {
    console.error(`Database seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();

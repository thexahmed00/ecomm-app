import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

import Category from '../src/models/Category';
import Product from '../src/models/Product';
import User from '../src/models/User';
import PromoCode from '../src/models/PromoCode';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI!);
    console.log('Connected!');

    console.log('Clearing existing data...');
    await Category.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({ email: 'admin@store.com' }); // Only clear specific admin to avoid wiping real users if any
    await PromoCode.deleteMany({});

    console.log('Seeding Categories...');
    const categoriesData = [
      { name: 'Electronics', slug: 'electronics', description: 'Gadgets and devices', isActive: true },
      { name: 'Fashion', slug: 'fashion', description: 'Clothing and accessories', isActive: true },
      { name: 'Home & Living', slug: 'home-living', description: 'Furniture and decor', isActive: true },
    ];
    const categories = await Category.insertMany(categoriesData);
    const catMap = {
      electronics: categories.find(c => c.slug === 'electronics')?._id,
      fashion: categories.find(c => c.slug === 'fashion')?._id,
      home: categories.find(c => c.slug === 'home-living')?._id,
    };

    console.log('Seeding Products...');
    const productsData = [];
    
    // Electronics (5)
    for (let i = 1; i <= 5; i++) {
      productsData.push({
        name: `Electronic Gadget ${i}`,
        slug: `electronic-gadget-${i}`,
        description: `This is a high-quality electronic gadget ${i}. Features advanced technology.`,
        price: 1000 * i,
        category: catMap.electronics,
        images: [{ url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg', publicId: 'sample' }],
        stock: 50,
        sku: `ELEC-${i}`,
        isFeatured: i === 1,
        isActive: true,
      });
    }

    // Fashion (5)
    for (let i = 1; i <= 5; i++) {
      productsData.push({
        name: `Fashion Item ${i}`,
        slug: `fashion-item-${i}`,
        description: `Trendy fashion item ${i} for all seasons.`,
        price: 500 * i,
        category: catMap.fashion,
        images: [{ url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg', publicId: 'sample' }],
        stock: 100,
        sku: `FASH-${i}`,
        isFeatured: i === 1,
        isActive: true,
      });
    }

    // Home & Living (5)
    for (let i = 1; i <= 5; i++) {
      productsData.push({
        name: `Home Decor ${i}`,
        slug: `home-decor-${i}`,
        description: `Beautiful home decor item ${i} to enhance your living space.`,
        price: 800 * i,
        category: catMap.home,
        images: [{ url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg', publicId: 'sample' }],
        stock: 30,
        sku: `HOME-${i}`,
        isFeatured: i === 1,
        isActive: true,
      });
    }

    await Product.insertMany(productsData);

    console.log('Seeding Admin User...');
    await User.create({
      email: 'admin@store.com',
      name: 'Store Admin',
      role: 'admin',
      firebaseUid: 'SEED_ADMIN_UID', // Placeholder
      addresses: [],
    });

    console.log('Seeding Promo Code...');
    await PromoCode.create({
      code: 'WELCOME10',
      discountType: 'percentage',
      discountValue: 10,
      minOrderAmount: 500,
      maxUses: 1000,
      isActive: true,
    });

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

seed();

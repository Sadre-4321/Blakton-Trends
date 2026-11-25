const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');
const Product = require('./models/Product');
const Category = require('./models/Category');
const Collection = require('./models/Collection');
const Banner = require('./models/Banner');

dotenv.config();

// Keep spaces in paths — browser / resolveImageUrl encode once at display time
const img = (folder, file) => `/Image/${folder}/${file}`;

const IMAGE_SETS = {
  'formal-shirt': {
    folder: 'Formal shirt',
    files: [
      'Img 1.jpg', 'Img 2.jpg', 'img 3.jpg', 'Img 4.jpg', 'Img 5.jpg', 'Img 6.jpg',
      'Img 7.jpg', 'Img 8.jpg', 'Img 9.jpg', 'Img 10.jpg', 'Img 11.jpg', 'Img 12.jpg',
      'Img 13.jpg', 'Img 14.jpg', 'Img 15.jpg', 'Img 16.jpg', 'Img 17.jpg', 'Img 18.jpg', 'Img 19.jpg',
    ],
  },
  'formal-pant': {
    folder: 'Formal paint',
    files: ['Pn 1.jpg', 'Pn 2.jpg', 'Pn 3.jpg', 'Pn 4.jpg', 'Pn 5.jpg', 'Pn 6.jpg', 'Pn 7.jpg'],
  },
  coat: {
    folder: 'Single coat',
    files: ['Ct 1.jpg', 'Ct 2.jpg', 'Ct 3.jpg', 'Ct 4.jpg', 'Ct 5.jpg', 'Ct 6.jpg', 'Ct 7.jpg', 'Ct 8.jpg', 'Ct 9.jpg', 'Ct 10.jpg'],
  },
  '2-piece': {
    folder: '2 peice',
    files: [
      'Pair 1.jpg', 'Pair 2.jpg', 'pair 3.jpg', 'Pair 4.jpg', 'Pair 5.jpg', 'pair 6.jpg',
      'pair 7.jpg', 'pair 8.jpg', 'pair 9.jpg', 'pair 10.jpg', 'Pair 11.jpg', 'Pair 12.jpg',
      'Pair 13.jpg', 'Pair 14.jpg',
    ],
  },
  'shirt-pant-pair': {
    folder: 'Paired shirt paint',
    files: [
      'Fr 1.jpg', 'Fr 2.jpg', 'Fr 3.jpg', 'Fr 4.jpg', 'Fr 5.jpg', 'Fr 6.jpg',
      'Fr 7.jpg', 'fr 8.jpg', 'Fr 9.jpg', 'Fr 10.jpg',
    ],
  },
  '3-piece': {
    folder: '3 peice',
    files: ['Tr 1.jpg', 'Tr 2.jpg', 'Tr 3.jpg', 'Tr 4.jpg', 'Tr 5.jpg', 'Tr 6.jpg', 'Tr 7.jpg', 'Tr 8.jpg', 'Tr 9.jpg', 'Tr 10.jpg'],
  },
  'kurta-pajama': {
    folder: 'Kurta pajamas',
    files: ['Kr 1.jpg', 'kr 2.jpg', 'Kr 3.jpg', 'Kr 4.jpg', 'Kr 5.jpg'],
  },
};

const categories = [
  { name: 'Formal Shirt', slug: 'formal-shirt', description: 'Stitched formal shirts for office and occasions' },
  { name: 'Formal Pant', slug: 'formal-pant', description: 'Straight, bootcut, baggy and slim fit pants' },
  { name: 'Coat / Blazer', slug: 'coat', description: 'Tailored coats and blazers' },
  { name: 'Kurta Pajama', slug: 'kurta-pajama', description: 'Kurta pajama sets for wedding and festive wear' },
  { name: '2 Piece', slug: '2-piece', description: 'Shirt + Pant coordinated sets' },
  { name: '3 Piece', slug: '3-piece', description: 'Shirt + Pant + Coat + Waistcoat ensembles' },
  { name: 'Summer Wear', slug: 'summer', description: 'Lightweight summer singles and pairs' },
  { name: 'Winter Wear', slug: 'winter', description: 'Warm winter singles and pairs' },
];

const collections = [
  { name: 'Formal Shirts', slug: 'formal-shirts', description: 'Only formal shirts', imageUrl: img('Formal shirt', 'Img 1.jpg') },
  { name: 'Formal Pants', slug: 'formal-pants', description: 'All pant fits and styles', imageUrl: img('Formal paint', 'Pn 1.jpg') },
  { name: 'Coats & Blazers', slug: 'coats-blazers', description: 'Coat only collection', imageUrl: img('Single coat', 'Ct 1.jpg') },
  { name: '2 Piece Sets', slug: '2-piece-sets', description: 'Shirt + Pant pairs', imageUrl: img('2 peice', 'Pair 1.jpg') },
  { name: '3 Piece Suits', slug: '3-piece-suits', description: 'Shirt + Pant + Coat + Waistcoat', imageUrl: img('3 peice', 'Tr 1.jpg') },
  { name: 'Summer Edit', slug: 'summer-edit', description: 'Summer singles and pairs', imageUrl: img('Paired shirt paint', 'Fr 1.jpg') },
  { name: 'Winter Edit', slug: 'winter-edit', description: 'Winter singles and pairs', imageUrl: img('Single coat', 'Ct 2.jpg') },
  { name: 'Kurta Collection', slug: 'kurta-collection', description: 'Wedding and festive kurtas', imageUrl: img('Kurta pajamas', 'Kr 1.jpg') },
];

const pantType = (index) => ['straight', 'bootcut', 'baggy', 'slim', 'regular'][index % 5];
const shirtColor = (index) => ['White', 'Sky Blue', 'Light Blue', 'Grey', 'Black', 'Cream', 'Pink', 'Lavender'][index % 8];
const pantColor = (index) => ['Navy', 'Black', 'Grey', 'Beige', 'Brown'][index % 5];
const coatColor = (index) => ['Navy', 'Charcoal', 'Black', 'Brown', 'Grey'][index % 5];

const buildProducts = () => {
  const products = [];

  IMAGE_SETS['formal-shirt'].files.forEach((file, index) => {
    const n = index + 1;
    const price = 1199 + (index % 6) * 100;
    const originalPrice = price + 500 + (index % 3) * 100;
    products.push({
      name: `Formal Shirt Design ${n}`,
      description: 'In-house stitched formal shirt. Premium finish for office and occasions.',
      price,
      originalPrice,
      category: 'formal-shirt',
      collection: 'formal-shirts',
      season: index % 3 === 0 ? 'summer' : 'all-season',
      pieceType: 'single',
      occasion: index % 4 === 0 ? 'party' : 'formal',
      fabric: 'Cotton',
      material: 'Cotton',
      fit: 'Regular Fit',
      color: shirtColor(index),
      colors: [shirtColor(index), 'White', 'Sky Blue'],
      included: ['Formal Shirt'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      images: [img('Formal shirt', file)],
      featured: index < 6,
      newArrival: index < 8,
      stock: 20 + index,
      onOffer: true,
    });
  });

  IMAGE_SETS['formal-pant'].files.forEach((file, index) => {
    const n = index + 1;
    const price = 1399 + (index % 5) * 150;
    const originalPrice = price + 600;
    products.push({
      name: `${pantType(index).charAt(0).toUpperCase() + pantType(index).slice(1)} Fit Formal Pant ${n}`,
      description: 'Tailored formal pant stitched for comfort and sharp look.',
      price,
      originalPrice,
      category: 'formal-pant',
      collection: 'formal-pants',
      season: 'all-season',
      pieceType: 'single',
      pantStyle: pantType(index),
      occasion: 'formal',
      fabric: 'Cotton Blend',
      material: 'Cotton Blend',
      fit: `${pantType(index)} fit`,
      color: pantColor(index),
      colors: [pantColor(index), 'Navy', 'Black'],
      included: ['Formal Pant'],
      sizes: ['28', '30', '32', '34', '36', '38'],
      images: [img('Formal paint', file)],
      featured: index < 4,
      newArrival: index < 3,
      stock: 18 + index,
      onOffer: true,
    });
  });

  IMAGE_SETS.coat.files.forEach((file, index) => {
    const n = index + 1;
    const price = 4499 + (index % 5) * 300;
    const originalPrice = price + 1500;
    products.push({
      name: `Single Coat / Blazer ${n}`,
      description: 'Premium single coat stitched in-house for formal and wedding wear.',
      price,
      originalPrice,
      category: 'coat',
      collection: 'coats-blazers',
      season: index % 2 === 0 ? 'winter' : 'all-season',
      pieceType: 'single',
      occasion: index % 3 === 0 ? 'wedding' : 'formal',
      fabric: 'Wool Blend',
      material: 'Wool Blend',
      fit: 'Tailored Fit',
      color: coatColor(index),
      colors: [coatColor(index), 'Navy', 'Black'],
      included: ['Coat / Blazer'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      images: [img('Single coat', file)],
      featured: index < 5,
      newArrival: index < 4,
      stock: 10 + index,
      onOffer: true,
    });
  });

  IMAGE_SETS['2-piece'].files.forEach((file, index) => {
    const n = index + 1;
    const price = 2599 + (index % 5) * 200;
    const originalPrice = price + 900;
    products.push({
      name: `2-Piece Set ${n}`,
      description: 'Coordinated shirt + pant set, stitched as a matching pair.',
      price,
      originalPrice,
      category: '2-piece',
      collection: '2-piece-sets',
      season: index % 2 === 0 ? 'summer' : 'all-season',
      pieceType: '2-piece',
      occasion: 'formal',
      fabric: 'Cotton',
      material: 'Cotton',
      fit: 'Regular Fit',
      color: pantColor(index),
      colors: [pantColor(index), 'Blue', 'Grey'],
      included: ['Shirt', 'Pant'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      images: [img('2 peice', file)],
      featured: index < 6,
      newArrival: index < 5,
      stock: 15 + index,
      onOffer: true,
    });
  });

  IMAGE_SETS['shirt-pant-pair'].files.forEach((file, index) => {
    const n = index + 1;
    const price = 2799 + (index % 4) * 200;
    const originalPrice = price + 1000;
    products.push({
      name: `Paired Shirt & Pant ${n}`,
      description: 'Matching shirt and pant pair for daily formal and festive wear.',
      price,
      originalPrice,
      category: '2-piece',
      collection: index % 2 === 0 ? 'summer-edit' : '2-piece-sets',
      season: index % 2 === 0 ? 'summer' : 'winter',
      pieceType: 'pair',
      occasion: index % 3 === 0 ? 'party' : 'formal',
      fabric: 'Cotton Blend',
      material: 'Cotton Blend',
      fit: 'Regular Fit',
      color: shirtColor(index),
      colors: [shirtColor(index), 'Navy', 'Grey'],
      included: ['Shirt', 'Pant'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      images: [img('Paired shirt paint', file)],
      featured: index < 5,
      newArrival: true,
      stock: 14 + index,
      onOffer: true,
    });
  });

  IMAGE_SETS['3-piece'].files.forEach((file, index) => {
    const n = index + 1;
    const price = 8999 + (index % 4) * 500;
    const originalPrice = price + 3000;
    products.push({
      name: `3-Piece Suit ${n}`,
      description: 'Full ensemble: Shirt + Pant + Coat + Waistcoat. Latest stitched designs.',
      price,
      originalPrice,
      category: '3-piece',
      collection: '3-piece-suits',
      season: index % 2 === 0 ? 'winter' : 'all-season',
      pieceType: '3-piece',
      occasion: index % 2 === 0 ? 'wedding' : 'formal',
      fabric: 'Premium Blend',
      material: 'Premium Blend',
      fit: 'Tailored Fit',
      color: coatColor(index),
      colors: [coatColor(index), 'Charcoal', 'Navy'],
      included: ['Shirt', 'Pant', 'Coat', 'Waistcoat'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      images: [img('3 peice', file)],
      featured: true,
      newArrival: index < 5,
      stock: 8 + index,
      onOffer: true,
    });
  });

  IMAGE_SETS['kurta-pajama'].files.forEach((file, index) => {
    const n = index + 1;
    const price = 1999 + index * 200;
    const originalPrice = price + 700;
    products.push({
      name: `Kurta Pajama Set ${n}`,
      description: 'Comfortable kurta pajama for wedding, festive and regular wear.',
      price,
      originalPrice,
      category: 'kurta-pajama',
      collection: 'kurta-collection',
      season: index % 2 === 0 ? 'summer' : 'all-season',
      pieceType: 'pair',
      occasion: index % 2 === 0 ? 'wedding' : 'regular',
      fabric: 'Cotton',
      material: 'Cotton',
      fit: 'Comfort Fit',
      color: ['Ivory', 'White', 'Beige', 'Cream', 'Gold'][index % 5],
      colors: ['Ivory', 'White', 'Beige'],
      included: ['Kurta', 'Pajama'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      images: [img('Kurta pajamas', file)],
      featured: index < 3,
      newArrival: true,
      stock: 20 + index,
      onOffer: true,
    });
  });

  return products.map((product) => {
    const discountPercent = product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;
    return {
      ...product,
      discountPercent,
      onOffer: discountPercent > 0,
      offerBadge: discountPercent >= 30 ? 'Bumper Offer' : discountPercent > 0 ? 'Special Offer' : '',
      returnDays: 7,
      refundDays: 7,
      deliveryDays: '3-5 business days',
      careInstructions: 'Dry clean preferred. Gentle hand wash cold. Do not bleach. Iron on medium heat.',
      status: 'active',
    };
  });
};

const seed = async () => {
  await connectDB();

  await User.deleteMany();
  await Product.deleteMany();
  await Category.deleteMany();
  await Collection.deleteMany();
  await Banner.deleteMany();

  await Category.insertMany(categories);
  await Collection.insertMany(collections);

  const products = buildProducts();
  await Product.insertMany(products);

  await Banner.insertMany([
    {
      title: 'You Like Tailor Since 1985',
      subtitle: 'Men\'s stitched formal wear — shirts, pants, coats & suits',
      imageUrl: img('3 peice', 'Tr 2.jpg'),
      image: img('3 peice', 'Tr 2.jpg'),
      link: '/products',
      order: 1,
      active: true,
      isActive: true,
    },
    {
      title: '2-Piece & Pair Collection',
      subtitle: 'Shirt + Pant sets with live offers',
      imageUrl: img('2 peice', 'Pair 5.jpg'),
      image: img('2 peice', 'Pair 5.jpg'),
      link: '/products/category/2-piece',
      order: 2,
      active: true,
      isActive: true,
    },
    {
      title: 'Formal Shirts — Latest Designs',
      subtitle: 'In-house stitching with premium finish',
      imageUrl: img('Formal shirt', 'Img 7.jpg'),
      image: img('Formal shirt', 'Img 7.jpg'),
      link: '/products/category/formal-shirt',
      order: 3,
      active: true,
      isActive: true,
    },
  ]);

  await User.create({
    name: 'Fitly Admin',
    email: 'admin@fitly.com',
    password: 'Admin123!',
    mobile: '9999999999',
    role: 'admin',
  });
  await User.create({
    name: 'Delivery Partner',
    email: 'delivery@fitly.com',
    password: 'Delivery123!',
    mobile: '9888888888',
    role: 'delivery_boy',
  });
  await User.create({
    name: 'Sample Customer',
    email: 'user@fitly.com',
    password: 'Customer123!',
    mobile: '9777777777',
    role: 'customer',
  });

  console.log(`Database seeded with ${products.length} products using local Image folder`);
  process.exit();
};

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});

'use client';

import { useParams } from 'next/navigation';
import { StoreProductDetailsView } from 'src/sections/storefront/view/store-product-details-view';

// ----------------------------------------------------------------------

// Mock product data mapping - in a real app, this would come from an API
const PRODUCT_DATA_MAP = {
  'classic-leather-loafers': 1,
  'chic-ballet-flats': 2,
  // Add more product mappings as needed
};

// Mock product data for new products
const ADDITIONAL_PRODUCTS = {
  2: {
    id: '2',
    name: 'Chic Ballet Flats',
    category: 'Shoes',
    manufacturer: 'Kitsch Studio',
    serialNumber: 'KS2024001',
    shipsFrom: 'Philippines',
    price: 25.18,
    originalPrice: 35.00,
    rating: 4.8,
    reviewCount: 1247,
    status: 'SALE',
    stock: 'IN STOCK',
    description: 'Elegant and comfortable ballet flats perfect for any occasion. Made with premium materials for lasting comfort and style.',
    images: [
      '/assets/images/product/product_1.jpg',
      '/assets/images/product/product_2.jpg',
      '/assets/images/product/product_3.jpg',
      '/assets/images/product/product_4.jpg',
      '/assets/images/product/product_5.jpg',
    ],
    colors: ['#000000', '#FFFFFF', '#FF6B6B'],
    sizes: ['6', '7', '8', '9'],
    quantity: 1,
    availableQuantity: 45,
    specifications: {
      category: 'Shoes',
      manufacturer: 'Kitsch Studio',
      serialNumber: 'KS2024001',
      shipsFrom: 'Philippines',
    },
    productDetails: [
      'Premium leather upper for durability and comfort',
      'Cushioned insole for all-day wear',
      'Flexible sole for natural movement',
      'Available in multiple colors and sizes',
      'Perfect for casual and formal occasions',
      'Handcrafted with attention to detail'
    ],
    benefits: [
      'Lightweight design for maximum comfort during long wear.',
      'Breathable materials keep your feet cool and dry.',
      'Versatile style that pairs with any outfit.',
      'Durable construction ensures long-lasting wear.'
    ],
    deliveryReturns: {
      freeDelivery: 'Your order of $200 or more gets free standard delivery.',
      standardDelivery: 'Standard delivered 4-5 Business Days',
      expressDelivery: 'Express delivered 2-4 Business Days',
      note: 'Orders are processed and delivered Monday-Friday (excluding public holidays)'
    }
  }
};

export default function StoreProductDetailsPage() {
  const params = useParams();
  const { storeId, productName } = params;

  // Find the product ID based on the product name slug
  const productId = PRODUCT_DATA_MAP[productName] || 1;

  return <StoreProductDetailsView id={productId} additionalProducts={ADDITIONAL_PRODUCTS} />;
}

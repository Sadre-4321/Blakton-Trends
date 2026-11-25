# You Like Tailor Since 1980 - Frontend

Professional e-commerce platform for ready-made clothing with modern UI/UX, clean architecture, and production-level standards.

## Project Overview

Transform a traditional offline tailoring business into a modern online clothing platform where customers can:
- Browse and search premium ready-made clothing products
- Explore collections (Regular Wear, Party Wear, Wedding Wear, Formal Wear)
- Add items to cart and wishlist
- Process secure checkout and payments
- Track orders in real-time
- Manage user profile and preferences

## Tech Stack

- **Frontend Framework:** React 18.3 + Vite
- **Styling:** Tailwind CSS 3.4
- **Routing:** React Router DOM v6
- **HTTP Client:** Axios
- **State Management:** React Context API
- **Build Tool:** Vite
- **Package Manager:** npm/yarn

## Project Structure

```
src/
├── assets/              # Images, fonts, media files
├── components/
│   ├── common/          # Reusable components (Navbar, Footer, etc.)
│   └── ui/              # UI components (buttons, cards, etc.)
├── pages/
│   ├── auth/            # Authentication pages
│   ├── shop/            # Product pages
│   ├── cart/            # Cart and wishlist
│   ├── checkout/        # Checkout flow
│   ├── profile/         # User profile
│   ├── orders/          # Order management
│   └── admin/           # Admin dashboard
├── layouts/             # Page layouts (Main, Admin)
├── routes/              # Route configuration
├── context/             # Context providers (Auth, Cart, Wishlist)
├── hooks/               # Custom hooks
├── services/            # API services
├── utils/               # Utility functions
├── constants/           # Application constants
├── config/              # Configuration files
├── store/               # State management (if using Redux)
├── App.jsx              # Root component
├── main.jsx             # Entry point
└── index.css            # Global styles
```

## Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Setup Steps

1. **Clone the repository**
   ```bash
   cd "Fitly shop"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your API endpoint:
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_CDN_URL=https://res.cloudinary.com/your-account
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```
   
   Server runs at: `http://localhost:5173`

## Available Scripts

```bash
# Development
npm run dev              # Start dev server with hot reload

# Production
npm run build            # Build optimized production bundle
npm run preview          # Preview production build locally

# Linting
npm run lint             # Run ESLint for code quality
```

## Key Features Implemented

### ✅ User Authentication
- Login/Register pages
- Password reset functionality
- Protected routes
- Session management

### ✅ Product Management
- Product listing with pagination
- Product detail page
- Search functionality
- Category/Collection filtering
- Product reviews

### ✅ Shopping Cart
- Add/remove items
- Quantity management
- Coupon/discount application
- Cart persistence
- Real-time totals

### ✅ Wishlist
- Add/remove wishlist items
- Wishlist persistence
- Move to cart functionality

### ✅ Checkout & Orders
- Multi-step checkout process
- Payment method selection
- Order confirmation
- Order tracking
- Invoice download

### ✅ User Profile
- Profile information management
- Shipping address management
- Order history
- Loyalty points

### ✅ Admin Dashboard
- Dashboard overview with statistics
- Product management (CRUD)
- Order management
- User management

### ✅ Responsive Design
- Mobile-first approach
- Tablet & desktop optimization
- Smooth animations
- Progressive enhancement

## API Endpoints Expected

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product details
- `GET /api/categories` - Get categories
- `GET /api/collections` - Get collections
- `GET /api/products/search?q=query` - Search products

### Cart
- `GET /api/cart` - Get cart
- `POST /api/cart/add` - Add to cart
- `PUT /api/cart/item/:productId` - Update quantity
- `DELETE /api/cart/item/:productId` - Remove from cart

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:orderId` - Get order details
- `GET /api/orders/:orderId/track` - Track order

## Global Styling

### Tailwind Classes
- `btn-primary` - Primary button
- `btn-secondary` - Secondary button
- `btn-outline` - Outline button
- `input-field` - Input styling
- `card` - Card styling
- `container-main` - Main container
- `section-padding` - Section padding

### Color Scheme
- Primary: `#1a1a1a` (Dark)
- Secondary: `#d4af37` (Gold)
- Accent: `#8b4513` (Brown)
- Light: `#f5f5f5` (Light Gray)

## Custom Hooks

- `useAuth()` - Authentication context
- `useCart()` - Cart context
- `useWishlist()` - Wishlist context
- `useFetch()` - Data fetching hook

## State Management

### Context Providers
1. **AuthContext** - User authentication & profile
2. **CartContext** - Shopping cart state
3. **WishlistContext** - Wishlist state

All providers wrap the app in `App.jsx`

## Local Storage Keys

- `authToken` - JWT authentication token
- `user` - User profile data
- `cart` - Shopping cart items
- `wishlist` - Wishlist items
- `theme` - Theme preference
- `recentSearches` - Recent search queries

## Animations

Built-in animations using Tailwind:
- `animate-fadeIn` - Fade in effect
- `animate-slideInLeft` - Slide from left
- `animate-slideInRight` - Slide from right

## Performance Optimization

- Code splitting with React Router
- Lazy loading of pages
- Image optimization recommended
- CSS minification in production
- Bundle analysis recommended

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Future Enhancements

- [ ] Advanced product filtering
- [ ] Product recommendations
- [ ] Loyalty program
- [ ] Live chat support
- [ ] Payment gateway integration
- [ ] SMS notifications
- [ ] Analytics dashboard
- [ ] Mobile app (React Native)

## Backend Integration

This frontend expects a MERN stack backend with:
- Node.js + Express.js
- MongoDB
- JWT authentication
- RESTful API structure

## Deployment

### Build for Production
```bash
npm run build
```

### Deployment Platforms
- Vercel
- Netlify
- AWS S3 + CloudFront
- GitHub Pages
- Azure Static Web Apps

## Configuration Files

- **vite.config.js** - Vite configuration
- **tailwind.config.js** - Tailwind customization
- **postcss.config.js** - PostCSS setup
- **.eslintrc.json** - ESLint rules
- **.env.example** - Environment variables template

## Support

For issues, feature requests, or questions, please contact the development team.

---

**Version:** 1.0.0  
**Last Updated:** 2024  
**Built with ❤️ for You Like Tailor Since 1980**

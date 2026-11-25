import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import ScrollToTop from '../components/common/ScrollToTop';

// Layouts
import AdminLayout from '../layouts/AdminLayout';
import MainLayout from '../layouts/MainLayout';

// Pages - Public
import HomePage from '../pages/HomePage';
import ProductDetailPage from '../pages/shop/ProductDetailPage';
import ProductListPage from '../pages/shop/ProductListPage';
import SearchPage from '../pages/shop/SearchPage';

// Pages - Auth
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';

// Pages - User
import CartPage from '../pages/cart/CartPage';
import WishlistPage from '../pages/cart/WishlistPage';
import CheckoutPage from '../pages/checkout/CheckoutPage';
import OrderSuccessPage from '../pages/checkout/OrderSuccessPage';
import OrderDetailPage from '../pages/orders/OrderDetailPage';
import OrdersPage from '../pages/orders/OrdersPage';
import UserProfilePage from '../pages/profile/UserProfilePage';

// Pages - Shop extras
import BestSellersPage from '../pages/shop/BestSellersPage';
import CategoryPage from '../pages/shop/CategoryPage';
import CollectionPage from '../pages/shop/CollectionPage';
import FeaturedPage from '../pages/shop/FeaturedPage';
import CustomizeOrderPage from '../pages/custom/CustomizeOrderPage';
import AdminCustomOrdersPage from '../pages/admin/AdminCustomOrdersPage';

// Pages - Admin
import AdminCustomersPage from '../pages/admin/AdminCustomersPage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminOrdersPage from '../pages/admin/AdminOrdersPage';
import AdminPaymentsPage from '../pages/admin/AdminPaymentsPage';
import AdminProductFormPage from '../pages/admin/AdminProductFormPage';
import AdminProductsPage from '../pages/admin/AdminProductsPage';
import AdminDeliveryBoysPage from '../pages/admin/AdminDeliveryBoysPage';
import AdminUsersPage from '../pages/admin/AdminUsersPage';

// Pages - Delivery / Admin extras / Error
import DeliveryDashboardPage from '../pages/delivery/DeliveryDashboardPage';
import DeliveryOrderDetailPage from '../pages/delivery/DeliveryOrderDetailPage';
import AdminBannersPage from '../pages/admin/AdminBannersPage';
import NotFoundPage from '../pages/NotFoundPage';

const AppRoutes = () => (
  <BrowserRouter>
    <ScrollToTop />
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="products" element={<ProductListPage />} />
        <Route path="products/collections" element={<CollectionPage />} />
        <Route path="products/bestsellers" element={<BestSellersPage />} />
        <Route path="products/featured" element={<FeaturedPage />} />
        <Route path="category/:type" element={<CategoryPage />} />
        <Route path="products/category/:category" element={<CategoryPage />} />
        <Route path="product/:id" element={<ProductDetailPage />} />
        <Route path="products/:productId" element={<ProductDetailPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="wishlist" element={<WishlistPage />} />
        <Route path="customize-order" element={<CustomizeOrderPage />} />
      </Route>

      {/* Auth Routes */}
      <Route path="login" element={<LoginPage />} />
      <Route path="register" element={<RegisterPage />} />
      <Route path="auth">
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password/:token" element={<ResetPasswordPage />} />
      </Route>

      {/* Cart & Checkout */}
      <Route path="/" element={<MainLayout />}>
        <Route path="cart" element={<CartPage />} />
        <Route
          path="checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route path="order-success/:orderId" element={<OrderSuccessPage />} />
      </Route>

      {/* User Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="profile" element={<UserProfilePage />} />
        <Route path="my-orders" element={<OrdersPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="orders/:orderId" element={<OrderDetailPage />} />
      </Route>

      {/* Admin Routes */}
      <Route
        path="admin"
        element={
          <ProtectedRoute adminOnly>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="products/add" element={<AdminProductFormPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="custom-orders" element={<AdminCustomOrdersPage />} />
        <Route path="payments" element={<AdminPaymentsPage />} />
        <Route path="customers" element={<AdminCustomersPage />} />
        <Route path="delivery-boys" element={<AdminDeliveryBoysPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="banners" element={<AdminBannersPage />} />
      </Route>

      {/* Delivery partner routes */}
      <Route
        path="delivery"
        element={
          <ProtectedRoute role="delivery_boy">
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DeliveryDashboardPage />} />
        <Route path=":orderId" element={<DeliveryOrderDetailPage />} />
      </Route>

      {/* Error Routes */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;

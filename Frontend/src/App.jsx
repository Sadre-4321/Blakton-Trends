import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import AppRoutes from './routes/AppRoutes';
import ErrorAlert from './components/common/ErrorAlert';
import SuccessAlert from './components/common/SuccessAlert';

function App() {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <ErrorAlert message={error} onClose={() => setError(null)} />
          <SuccessAlert message={success} onClose={() => setSuccess(null)} />
          <AppRoutes />
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ChangePassword from './pages/ChangePassword';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import Brand from './pages/Brand';
import BrandProducts from './pages/BrandProducts';
import OrderTracking from './pages/OrderTracking';
import Orders from './pages/Orders';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ProductProvider } from './context/ProductContext';
import { AuthProvider } from './context/AuthContext';
import Store from './pages/Store';
import About from './pages/About';
import Contact from './pages/Contact';
import ViewAll from './pages/ViewAll';


function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-dark">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Router>
      <AuthProvider>
        <ProductProvider>
          <CartProvider>
            <WishlistProvider>
              <div className="flex flex-col min-h-screen bg-dark text-light">
                <Toaster 
                  position="top-right"
                  toastOptions={{
                    style: {
                      background: '#333',
                      color: '#fff',
                    },
                    success: {
                      style: {
                        background: 'green',
                      },
                    },
                    error: {
                      style: {
                        background: '#ef4444',
                      },
                    },
                  }}
                />
                <Header />
                <main className="flex-grow">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/store" element={<Store />} />
                    <Route path="/view-all" element={<ViewAll />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/product/:id" element={<ProductDetails />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/wishlist" element={<Wishlist />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/brand/:brandId" element={<Brand />} />
                    <Route path="/brand/:brandId/new-arrivals" element={<BrandProducts />} />
                    <Route path="/brand/:brandId/most-selling" element={<BrandProducts />} />

                    {/* Protected Routes */}
                    <Route 
                      path="/profile" 
                      element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/change-password" 
                      element={
                        <ProtectedRoute>
                          <ChangePassword />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/account/orders/:orderId" 
                      element={
                        <ProtectedRoute>
                          <OrderTracking />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/account/orders" 
                      element={
                        <ProtectedRoute>
                          <Orders />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/order-tracking/:orderId" 
                      element={<OrderTracking />} 
                    />

                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            </WishlistProvider>
          </CartProvider>
        </ProductProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
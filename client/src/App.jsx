import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

// Components
import Navbar from './components/Navbar';
import CategoryBar from './components/CategoryBar';
import BottomNav from './components/BottomNav';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import FloatingWhatsApp from './components/FloatingWhatsApp';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import AdminDashboard from './pages/admin/AdminDashboard';
import MyOrders from './pages/MyOrders';
import OrderDetails from './pages/OrderDetails';
import Wishlist from './pages/Wishlist';
import Profile from './pages/Profile';
import Category from './pages/Category';
import InvoicePage from './pages/InvoicePage';
import Contact from './pages/Contact';

// Support Pages
import About from './pages/support/About';
import Shipping from './pages/support/Shipping';
import RefundReturn from './pages/support/RefundReturn';
import Cancellation from './pages/support/Cancellation';
import TermsOfUse from './pages/support/TermsOfUse';
import PrivacyPolicy from './pages/support/PrivacyPolicy';
import FAQ from './pages/support/FAQ';
import Careers from './pages/support/Careers';
import Stories from './pages/support/Stories';
import Payments from './pages/support/Payments';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <Router>
            <div className="min-h-screen bg-gray-50 flex flex-col">
              <Navbar />
              <CategoryBar />

              <main className="flex-1 pb-[60px] md:pb-0">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/product/:id" element={<ProductDetails />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/category/:categoryName" element={<Category />} />
                  <Route path="/contact" element={<Contact />} />

                  {/* Support Routes */}
                  <Route path="/about" element={<About />} />
                  <Route path="/shipping" element={<Shipping />} />
                  <Route path="/return-policy" element={<RefundReturn />} />
                  <Route path="/cancellation" element={<Cancellation />} />
                  <Route path="/terms" element={<TermsOfUse />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/careers" element={<Careers />} />
                  <Route path="/stories" element={<Stories />} />
                  <Route path="/payments" element={<Payments />} />

                  {/* Protected Routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/order-success/:orderId" element={<OrderSuccess />} />
                    <Route path="/order/:orderId" element={<OrderDetails />} />
                    <Route path="/my-orders" element={<MyOrders />} />
                    <Route path="/wishlist" element={<Wishlist />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/invoice/:orderId" element={<InvoicePage />} />
                  </Route>

                  {/* Admin Only Routes */}
                  <Route element={<AdminRoute />}>
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/*" element={<AdminDashboard />} />
                  </Route>
                </Routes>
              </main>

              <FloatingWhatsApp />
              <BottomNav />
            </div>
            <Toaster
              position="bottom-center"
              toastOptions={{
                duration: 2500,
                style: {
                  background: '#333',
                  color: '#fff',
                  fontSize: '14px',
                  borderRadius: '8px'
                },
                success: {
                  iconTheme: {
                    primary: '#4ade80',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </Router>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;

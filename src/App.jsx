import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./component/contexts/ThemeContext";
import { AuthProvider } from "./component/contexts/AuthContext";
import { NotificationProvider } from "./component/contexts/NotificationContext";
import { CartProvider } from "./component/contexts/CartContext";
import { ToastProvider } from "./component/contexts/ToastContext";
import { AddressProvider } from "./component/contexts/AddressContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Layout from "./component/layout/Layout";
import Welcome from "./component/pages/Welcome";
import Home from "./component/pages/Home";
import Login from "./component/pages/Login";
import Register from "./component/pages/Register";
import EmailVerification from "./components/EmailVerification";
import AuctionDetail from "./component/pages/AuctionDetail";
import Auctions from "./component/pages/Auctions";
import Profile from "./component/pages/Profile";
import ProfileOverview from "./component/pages/ProfileOverview";
import ProfileBids from "./component/pages/ProfileBids";
import ProfileFavorites from "./component/pages/ProfileFavourites";
import Cart from "./component/pages/Cart";
import Messages from "./component/pages/Messages";
import Conversation from "./component/pages/Conversation";
import ProtectedRoute from "./component/auth/ProtectedRoute";
import ForgotPassword from "./component/pages/ForgetPassword";
import ResetPassword from "./component/pages/ResetPassword";
import CategoryPage from "./component/pages/CategoryPage";
import Categories from "./component/pages/Categories";
import CreateAuction from "./component/pages/CreateAuction";
import AddProduct from "./component/AddProduct";
import Items from "./component/pages/Items";
import ItemDetail from "./component/pages/ItemDetail";
import ProfileCompletedAuctions from "./component/pages/ProfileCompletedAuctions";
import OrderSuccess from "./component/pages/OrderSuccess";
import OrderFail from "./component/pages/OrderFail";
import Notifications from "./component/pages/Notifications";
import SellerDashboard from "./component/pages/SellerDashboard";
import Settings from "./component/pages/Settings";
import AdminDashboard from "./component/pages/admin/AdminDashboard";
import AdminSubcategoryManagement from "./component/admin/AdminSubcategoryManagement";
import AdminUserManagement from "./component/admin/AdminUserManagement";
import AdminUserDetails from "./component/admin/AdminUserDetails";
import AdminCategoryManagement from "./component/admin/AdminCategoryManagement";
import AdminAuctionManagement from "./component/pages/admin/AdminAuctionManagement";
import AdminItemManagement from "./component/pages/admin/AdminItemManagement";
import NotFound from "./component/pages/NotFound";
import AdminItemDetailPage from "./component/pages/admin/AdminItemDetailPage";
import AdminOrderManagement from "./component/pages/Admin/AdminOrderManagement";
import OrderTablePage from "./component/pages/Admin/OrderTablePage";
import AdminOrderDetailPage from "./component/pages/admin/AdminOrderDetailPage";
// import AdminOrderManagement from "./component/pages/admin/AdminOrderManagement";

// import ProfileAuctions from "./component/pages/ProfileAuctions"
// import SubcategoryPage from "./component/pages/SubcategoryPage"
// import Subcategories from "./component/pages/Subcategories"

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AddressProvider>
          <NotificationProvider>
            <CartProvider>
              <ToastProvider>
                <Router>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Welcome />} />
                      <Route path="/home" element={<Home />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route
                        path="/verify-email"
                        element={<EmailVerification />}
                      />
                      <Route
                        path="/forgot-password"
                        element={<ForgotPassword />}
                      />
                      <Route
                        path="/reset-password"
                        element={<ResetPassword />}
                      />
                      <Route path="/auctions" element={<Auctions />} />
                      <Route path="/auctions/:id" element={<AuctionDetail />} />
                      <Route
                        path="/auctions/create"
                        element={
                          <ProtectedRoute>
                            <CreateAuction />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/products/add"
                        element={
                          <ProtectedRoute>
                            <AddProduct />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/orders"
                        element={
                          <ProtectedRoute>
                            <AdminOrderManagement />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/orders/table"
                        element={
                          <ProtectedRoute adminOnly>
                            <OrderTablePage />
                          </ProtectedRoute>
                        }
                      />
                      <Route path="/items" element={<Items />} />
                      <Route path="/items/:id" element={<ItemDetail />} />
                      <Route path="/categories" element={<Categories />} />
                      <Route
                        path="/categories/:id"
                        element={<CategoryPage />}
                      />
                      <Route
                        path="/notifications"
                        element={<Notifications />}
                      />
                      {/* <Route path="/subcategory/:id" element={<CategoryPage />} /> */}
                      <Route
                        path="/payment/success"

                        element={

                          <OrderSuccess />

                        }
                      />
                      <Route path="/payment/fail" element={<OrderFail />} />

                      <Route
                        path="/profile/favorites"
                        element={
                          <ProtectedRoute>
                            <ProfileFavorites />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="profile/completed-auctions"
                        element={
                          <ProtectedRoute>
                            <ProfileCompletedAuctions />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="profile"
                        element={
                          <ProtectedRoute>
                            <Profile />
                          </ProtectedRoute>
                        }
                      >
                        <Route index element={<ProfileOverview />} />
                        <Route
                          path="seller-dashboard"
                          element={<SellerDashboard />}
                        />
                        <Route path="settings" element={<Settings />} />
                        <Route
                          path="profile/bids"
                          element={
                            <ProtectedRoute>
                              <ProfileBids />
                            </ProtectedRoute>
                          }
                        />
                      </Route>
                      {/* Standalone route for favorites */}

                      <Route
                        path="/cart"
                        element={
                          <ProtectedRoute>
                            <Cart />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/messages"
                        element={
                          <ProtectedRoute>
                            <Messages />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/messages/:id"
                        element={
                          <ProtectedRoute>
                            <Conversation />
                          </ProtectedRoute>
                        }
                      />
                      {/* Admin Dashboard Route */}
                      <Route
                        path="/admin/dashboard"
                        element={
                          <ProtectedRoute adminOnly>
                            <AdminDashboard />
                          </ProtectedRoute>
                        }
                      />
                      {/* Admin Subcategory Management Route */}
                      <Route
                        path="/admin/categories/:categoryId/subcategories"
                        element={
                          <ProtectedRoute adminOnly>
                            <AdminSubcategoryManagement />
                          </ProtectedRoute>
                        }
                      />
                      {/* Admin Category Management Route */}
                      <Route
                        path="/admin/categories/"
                        element={
                          <ProtectedRoute adminOnly>
                            <AdminCategoryManagement />
                          </ProtectedRoute>
                        }
                      />

                      {/* Admin Item Management Route */}
                      <Route
                        path="/admin/items/"
                        element={
                          <ProtectedRoute adminOnly>
                            <AdminItemManagement />
                          </ProtectedRoute>
                        }
                      />

                      {/* Admin User Management Route */}
                      <Route
                        path="/admin/users"
                        element={
                          <ProtectedRoute adminOnly>
                            <AdminUserManagement />
                          </ProtectedRoute>
                        }
                      />

                      {/* Admin User Details Route */}
                      <Route
                        path="/admin/users/:userId"
                        element={
                          <ProtectedRoute adminOnly>
                            <AdminUserDetails />
                          </ProtectedRoute>
                        }
                      />

                      {/* Admin Auction Management Route */}
                      <Route
                        path="/admin/auctions"
                        element={
                          <ProtectedRoute adminOnly>
                            <AdminAuctionManagement />
                          </ProtectedRoute>
                        }
                      />

                      {/* Admin Item Detail Route */}
                      <Route
                        path="/admin/items/:itemId"
                        element={
                          <ProtectedRoute adminOnly>
                            <AdminItemDetailPage />
                          </ProtectedRoute>
                        }
                      />

                      {/* Admin Order Detail Route */}
                      <Route
                        path="/admin/orders/:orderId"
                        element={
                          <ProtectedRoute adminOnly>
                            <AdminOrderDetailPage />
                          </ProtectedRoute>
                        }
                      />
                    </Routes>
                  </Layout>
                  <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="light"
                  />
                </Router>
              </ToastProvider>
            </CartProvider>
          </NotificationProvider>
        </AddressProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./component/contexts/ThemeContext";
import { AuthProvider } from "./component/contexts/AuthContext";
import { NotificationProvider } from "./component/contexts/NotificationContext";
import { ToastProvider } from "./component/contexts/ToastContext";
import Layout from "./component/layout/Layout";
import Welcome from "./component/pages/Welcome";
import Home from "./component/pages/Home";
import Login from "./component/pages/Login";
import Register from "./component/pages/Register";
import AuctionDetail from "./component/pages/AuctionDetail";
import Auctions from "./component/pages/Auctions";
import Profile from "./component/pages/Profile";
// import ProfileAuctions from "./component/pages/ProfileAuctions"
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
// import SubcategoryPage from "./component/pages/SubcategoryPage"
// import Subcategories from "./component/pages/Subcategories"
import CreateAuction from "./component/pages/CreateAuction";
import AddProduct from "./component/AddProduct";
import Items from "./component/pages/Items";
import ItemDetail from "./component/pages/ItemDetail";
import ProfileCompletedAuctions from "./component/pages/ProfileCompletedAuctions";
import Notifications from "./component/pages/Notifications";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <ToastProvider>
            <Router>
              <Layout>
                <Routes>
                  <Route path="/" element={<Welcome />} />
                  <Route path="/home" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
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
                  <Route path="/items" element={<Items />} />
                  <Route path="/items/:id" element={<ItemDetail />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/category/:id" element={<CategoryPage />} />
                  {/* <Route path="/subcategory/:id" element={<CategoryPage />} /> */}

                  <Route
                    path="/profile/favorites"
                    element={
                      <ProtectedRoute>
                        <ProfileFavorites />
                      </ProtectedRoute>
                    }
                  />
                  {/* <Route
                    path="profile/auctions"
                    element={
                      <ProtectedRoute>
                        <ProfileAuctions />
                      </ProtectedRoute>
                    }
                  /> */}

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
                    {/* <Route
                      path="profile/auctions"
                      element={
                        <ProtectedRoute>
                          <ProfileAuctions />
                        </ProtectedRoute>
                      }
                    /> */}
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
                  <Route path="/notifications" element={<Notifications />} />
                </Routes>
              </Layout>
            </Router>
          </ToastProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

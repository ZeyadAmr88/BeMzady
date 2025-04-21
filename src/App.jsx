import React from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ThemeProvider } from "./component/contexts/ThemeContext"
import { AuthProvider } from "./component/contexts/AuthContext"
import { NotificationProvider } from "./component/contexts/NotificationContext"
import Layout from "./component/layout/Layout"
import Welcome from "./component/pages/Welcome"
import Home from "./component/pages/Home"
import Login from "./component/pages/Login"
import Register from "./component/pages/Register"
import AuctionDetail from "./component/pages/AuctionDetail"
import Auctions from "./component/pages/Auctions"
import Profile from "./component/pages/Profile"
import ProfileAuctions from "./component/pages/ProfileAuctions"
import ProfileBids from "./component/pages/ProfileBids"
import Cart from "./component/pages/Cart"
import Messages from "./component/pages/Messages"
import Conversation from "./component/pages/Conversation"
import ProtectedRoute from "./component/auth/ProtectedRoute"
import ForgotPassword from "./component/pages/ForgetPassword"
import ResetPassword from "./component/pages/ResetPassword"
import CategoryPage from "./component/pages/CategoryPage"
import Categories from "./component/pages/Categories"
import CreateAuction from "./component/pages/CreateAuction"
import AddProduct from "./component/AddProduct"

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
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
                <Route path="/auctions/create" element={<ProtectedRoute><CreateAuction /></ProtectedRoute>} />
                <Route path="/products/add" element={<ProtectedRoute><AddProduct /></ProtectedRoute>} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/category/:id" element={<CategoryPage />} />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                >
                  <Route
                    path="auctions"
                    element={
                      <ProtectedRoute>
                        <ProfileAuctions />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="bids"
                    element={
                      <ProtectedRoute>
                        <ProfileBids />
                      </ProtectedRoute>
                    }
                  />
                </Route>
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
              </Routes>
            </Layout>
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App

import "./App.css";
import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Home_Page from "./layout/Home_Page";
import Online_Booking from "./screens/Online_Booking";
import ContactForm from "./screens/Contact";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { ToastContainer } from "react-toastify";
import DashBoard from "./DashBoard/Admin/DashBoard";
import Profile from "./screens/Profile";
import EditProfile from "./screens/EditProfile";
import Grooming from "./screens/Grooming";
import MyPets from "./screens/MyPets";
import UserBookings from "./screens/UserBookings";
import LoginForm from "./screens/LoginForm";
import RegisterForm from "./screens/RegisterForm";
import Change_Password from "./screens/Change_Password";
import Forgot_Password from "./screens/Forgot_Password";
import ResetPass from "./screens/ResetPass";

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();
  
  // Kiểm tra xem người dùng có đang ở trang đăng nhập hoặc đăng ký không
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";
  
  useEffect(() => {
    const loggedInStatus = localStorage.getItem("isLoggedIn");
    if (loggedInStatus === "true") {
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <div className={isAuthPage ? "auth-page" : ""}>
      {!isAuthPage && <Header isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />}
      <Routes>
          <Route path="/" element={<Home_Page />} />
          <Route path="/grooming" element={<Grooming />} />
          <Route path="/online-booking" element={<Online_Booking />} />
          <Route
            path="/login"
            element={
              <LoginForm
                isLoggedIn={isLoggedIn}
                setIsLoggedIn={setIsLoggedIn}
              />
            }
          />
          <Route path="/register" element={<RegisterForm />} />
          <Route
            path="/contact"
            element={
              <>
                <ContactForm />
              </>
            }
          />
          <Route
            path="/changepass"
            element={
              <>
                <Change_Password />
                <Footer />
              </>
            }
          />
          <Route
            path="/forgot"
            element={
              <>
                <Forgot_Password />
                <Footer />
              </>
            }
          />
          <Route
            path="/reset-password/:id/:token"
            element={
              <>
                <ResetPass />
                <Footer />
              </>
            }
          />
          <Route
            path="/dashboard"
            element={
              <>
                <DashBoard />
                <Footer />
              </>
            }
          />
          <Route path="/profile" element={<Profile />} />
          <Route path="/editprofile" element={<EditProfile />} />
          <Route path="/booking-status" element={<UserBookings />} />
          <Route path="/my-bookings" element={<UserBookings />} />
          <Route path="/pets" element={<MyPets />} />
        </Routes>
        <ToastContainer />
      </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;

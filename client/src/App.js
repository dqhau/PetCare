import "./App.css";
import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import HomePage from "./pages/home/HomePage";
import OnlineBooking from "./pages/booking/onlineBooking";
import ContactForm from "./pages/contact/Contact";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import { ToastContainer } from "react-toastify";
import DashBoard from "./pages/admin/DashBoard";
import Profile from "./pages/profile/Profile";
import EditProfile from "./pages/profile/EditProfile";
import Grooming from "./pages/booking/Grooming";
import MyPets from "./pages/pets/MyPets";
import UserBookings from "./pages/booking/UserBookings";
import LoginForm from "./pages/auth/LoginForm";
import RegisterForm from "./pages/auth/RegisterForm";
import ChangePassword from "./pages/profile/changePassword";
import ForgotPassword from "./pages/auth/forgotPassword";
import ResetPass from "./pages/auth/ResetPass";
// import VaccinationHistoryUser from "./pages/booking/VaccinationHistoryUser";
// File này hiện không tồn tại trong dự án

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
          <Route path="/" element={<HomePage />} />
          <Route path="/grooming" element={<Grooming />} />
          <Route path="/online-booking" element={<OnlineBooking />} />
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
                <ChangePassword />
                <Footer />
              </>
            }
          />
          <Route
            path="/forgot"
            element={
              <>
                <ForgotPassword />
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
          {/* <Route path="/vaccination-history" element={<VaccinationHistoryUser />} /> */}
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

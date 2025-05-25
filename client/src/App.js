import "./App.css";
import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import HomePage from "./layout/homePage";
import OnlineBooking from "./screens/onlineBooking";
import ContactForm from "./screens/Contact";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { ToastContainer } from "react-toastify";
import DashBoard from "./Admin/DashBoard";
import Profile from "./screens/Profile";
import EditProfile from "./screens/EditProfile";
import Grooming from "./screens/Grooming";
import MyPets from "./screens/MyPets";
import UserBookings from "./screens/UserBookings";
import LoginForm from "./screens/LoginForm";
import RegisterForm from "./screens/RegisterForm";
import ChangePassword from "./screens/changePassword";
import ForgotPassword from "./screens/forgotPassword";
import ResetPass from "./screens/ResetPass";
import VaccinationHistoryUser from "./components/VaccinationHistory/VaccinationHistoryUser";

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
          <Route path="/vaccination-history" element={<VaccinationHistoryUser />} />
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

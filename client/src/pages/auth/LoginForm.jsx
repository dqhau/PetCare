import React, { useRef, useState } from "react";
import { Spinner } from "react-bootstrap";
import "../../styles/enhancedForms.css";
import logo from "../../assets/images/pet-logo-main.png";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaUser, FaLock } from "react-icons/fa";
import axiosInstance from "../../utils/axiosConfig";

const LoginForm = ({ setIsLoggedIn }) => {
  const formRef = useRef(null);
  const nav = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    const form = formRef.current;
    const username = form.elements["input-name"].value;
    const password = form.elements["password_field"].value;

    const data = { username, password };

    try {
      const res = await axiosInstance.post("/users/login", data, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const { accessToken, username: userName, id, fullname, role } = res.data;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("username", userName);
      localStorage.setItem("fullname", fullname);
      localStorage.setItem("userId", id);
      localStorage.setItem("role", role);

      setIsLoggedIn(true);
      localStorage.setItem("isLoggedIn", "true");
      toast.success("Login successful!");
      nav("/");
    } catch (error) {
      console.log('Login error:', error);
      
      if (error.response) {
        if (error.response.status === 401) {
          const errorMessage = error.response.data?.error || "Tài khoản hoặc mật khẩu không chính xác";
          toast.error(errorMessage);
        } else {
          const errorMessage = error.response.data?.error || "Đăng nhập không thành công";
          toast.error(errorMessage);
        }
      } else if (error.request) {
        toast.error("Không thể kết nối đến máy chủ");
      } else {
        toast.error("Đăng nhập không thành công");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-form-container" style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: '#F5F5F5'
    }}>
      <div className="login-form-card" style={{ 
        width: 410, 
        background: '#fff',
        padding: '36px 28px',
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.13), 0 1.5px 6px rgba(0,0,0,0.06)'
      }}>
        <img src={logo} alt="PetCare" style={{ 
          height: 60,
          marginBottom: 24
        }} />
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: '600', 
          marginBottom: '8px',
          color: '#000'
        }}>Đăng nhập</h2>
        <p style={{ 
          fontSize: '14px', 
          color: '#666', 
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          Chào mừng bạn trở lại! Vui lòng đăng nhập để tiếp tục.
        </p>

        <form onSubmit={handleSubmit} ref={formRef} style={{ width: '100%' }}>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <FaUser size={14} style={{ marginRight: '8px', marginBottom: '2px' }} />
              <span style={{
                fontSize: '14px',
                color: '#000'
              }}>
                Tên đăng nhập
              </span>
            </div>
            <input
              name="input-name"
              type="text"
              required
              autoComplete="username"
              placeholder="Nhập tên đăng nhập"
              style={{ 
                width: '100%',
                padding: '12px',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: '#F8FAFC'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <FaLock size={14} style={{ marginRight: '8px', marginBottom: '2px' }} />
              <span style={{
                fontSize: '14px',
                color: '#000'
              }}>
                Mật khẩu
              </span>
            </div>
            <input
              name="password_field"
              type="password"
              required
              autoComplete="current-password"
              placeholder="Nhập mật khẩu của bạn"
              style={{ 
                width: '100%',
                padding: '12px',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: '#F8FAFC'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{ 
              width: '100%',
              padding: '12px',
              backgroundColor: '#0066FF',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '500',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              marginBottom: '16px',
              boxShadow: '0 2px 8px rgba(0,102,255,0.08)'
            }}
          >
            {isSubmitting ? (
              <>
                <Spinner animation="border" size="sm" style={{ marginRight: 8 }} />
                Đang đăng nhập...
              </>
            ) : 'Đăng nhập'}
          </button>

          <div style={{ 
            textAlign: 'center',
            color: '#666',
            fontSize: '14px',
            marginBottom: '16px'
          }}>
            hoặc
          </div>

          <div style={{ 
            textAlign: 'center'
          }}>
            <Link 
              to="/register" 
              style={{ 
                color: '#0066FF',
                textDecoration: 'none',
                fontSize: '14px',
                display: 'block',
                marginBottom: '8px'
              }}
            >
              Tạo tài khoản mới
            </Link>
            <Link 
              to="/forgot" 
              style={{ 
                color: '#0066FF',
                textDecoration: 'none',
                fontSize: '14px'
              }}
            >
              Quên mật khẩu?
            </Link>
          </div>
        </form>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default LoginForm;

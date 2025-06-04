import React, { useRef, useState } from "react";
import { Spinner } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../styles/enhancedForms.css";
import logo from "../../assets/images/pet-logo-main.png";
import { FaUser, FaLock, FaIdCard } from "react-icons/fa";
import axiosInstance from "../../utils/axiosConfig";

const RegisterForm = () => {
  const [confirmPassword, setConfirmPassword] = useState("");
  const formRef = useRef(null);
  const nav = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const form = formRef.current;
    const username = form.elements["input-name"].value;
    const password = form.elements["password_field"].value;
    const fullname = form.elements["input-fullname"].value;

    // Kiểm tra mật khẩu xác nhận
    if (password !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      setIsSubmitting(false);
      return;
    }

    const data = { fullname, username, password };
    try {
      const res = await axiosInstance.post(
        "/users/register",
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const { accessToken } = res.data;
      localStorage.setItem("accessToken", accessToken);
      toast.success("Đăng ký thành công!");
      nav("/login");
    } catch (error) {
      console.log('Registration error:', error);
      
      if (error.response) {
        const errorMessage = error.response.data?.error || "Đăng ký không thành công";
        toast.error(errorMessage);
      } else if (error.request) {
        toast.error("Không thể kết nối đến máy chủ");
      } else {
        toast.error("Đăng ký không thành công");
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
        padding: '24px 28px',
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.13), 0 1.5px 6px rgba(0,0,0,0.06)'
      }}>
        <img src={logo} alt="PetCare" style={{ 
          height: 50,
          marginBottom: 16
        }} />
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: '600', 
          marginBottom: '4px',
          color: '#000'
        }}>Đăng ký tài khoản</h2>
        <p style={{ 
          fontSize: '14px', 
          color: '#666', 
          marginBottom: '16px',
          textAlign: 'center'
        }}>
          Tạo tài khoản mới để sử dụng đầy đủ các tính năng của ứng dụng
        </p>

        <form onSubmit={handleRegister} ref={formRef} style={{ width: '100%' }}>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              marginBottom: '4px'
            }}>
              <FaIdCard size={14} style={{ marginRight: '8px' }} />
              <span style={{
                fontSize: '14px',
                color: '#000'
              }}>
                Họ và tên
              </span>
            </div>
            <input
              name="input-fullname"
              type="text"
              required
              autoComplete="name"
              placeholder="Nhập họ và tên của bạn"
              style={{ 
                width: '100%',
                padding: '10px',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: '#F8FAFC'
              }}
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              marginBottom: '4px'
            }}>
              <FaUser size={14} style={{ marginRight: '8px' }} />
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
              placeholder="Nhập tên đăng nhập của bạn"
              style={{ 
                width: '100%',
                padding: '10px',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: '#F8FAFC'
              }}
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              marginBottom: '4px'
            }}>
              <FaLock size={14} style={{ marginRight: '8px' }} />
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
              autoComplete="new-password"
              placeholder="Nhập mật khẩu của bạn"
              style={{ 
                width: '100%',
                padding: '10px',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: '#F8FAFC'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              marginBottom: '4px'
            }}>
              <FaLock size={14} style={{ marginRight: '8px' }} />
              <span style={{
                fontSize: '14px',
                color: '#000'
              }}>
                Xác nhận mật khẩu
              </span>
            </div>
            <input
              name="confirm_password_field"
              type="password"
              required
              autoComplete="new-password"
              placeholder="Nhập lại mật khẩu của bạn"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              style={{ 
                width: '100%',
                padding: '10px',
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
              padding: '10px',
              backgroundColor: '#2ECC71',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '500',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {isSubmitting ? (
              <>
                <Spinner animation="border" size="sm" style={{ marginRight: 8 }} />
                Đang đăng ký...
              </>
            ) : 'Đăng ký ngay'}
          </button>

          <div style={{ 
            textAlign: 'center',
            color: '#666',
            fontSize: '14px',
            marginBottom: '12px'
          }}>
            hoặc
          </div>

          <div style={{ 
            textAlign: 'center'
          }}>
            <Link 
              to="/login" 
              style={{ 
                color: '#0066FF',
                textDecoration: 'none',
                fontSize: '14px'
              }}
            >
              Đã có tài khoản? Đăng nhập ngay
            </Link>
          </div>
        </form>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default RegisterForm;

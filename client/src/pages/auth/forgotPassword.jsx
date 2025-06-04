import React, { useRef, useState } from "react";
import { Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { HiLockClosed } from "react-icons/hi";
import { MdEmail } from "react-icons/md";
import axiosInstance from "../../utils/axiosConfig";
import Breadcrumbs from "../../components/common/Breadcrumbs";

const ForgotPassword = () => {
  const formRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const form = formRef.current;
    const email = form.elements["email"].value;

    try {
      await axiosInstance.post("/users/forgot-password", { email });
      toast.success("Link đặt lại mật khẩu đã được gửi đến email của bạn!");
    } catch (error) {
      if (error.response) {
        if (error.response.data?.Error?.includes("Không tìm thấy người dùng")) {
          toast.error("Email này chưa được đăng ký tài khoản. Vui lòng kiểm tra lại hoặc đăng ký mới.");
        } else {
          const errorMessage = error.response.data?.Error || "Không thể gửi yêu cầu đặt lại mật khẩu";
          toast.error(errorMessage);
        }
      } else if (error.request) {
        toast.error("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
      } else {
        toast.error("Đã có lỗi xảy ra. Vui lòng thử lại sau.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#fff'
    }}>
      <Breadcrumbs />
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: '40px'
      }}>
        <div style={{
          width: 400,
          background: '#fff',
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          padding: '48px 32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <HiLockClosed size={40} color="#4096ff" style={{ marginBottom: 24 }} />
          <h2 style={{
            fontSize: 24,
            fontWeight: 600,
            marginBottom: 8,
            color: '#222',
            textAlign: 'center'
          }}>Quên mật khẩu?</h2>
          <p style={{
            fontSize: 15,
            color: '#888',
            marginBottom: 32,
            textAlign: 'center'
          }}>
            Nhập email của bạn để nhận link đặt lại mật khẩu
          </p>
          <form onSubmit={handleSubmit} ref={formRef} style={{ width: '100%' }}>
            <div style={{ marginBottom: 24 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: 15,
                fontWeight: 500,
                marginBottom: 8,
                color: '#222'
              }}>
                <MdEmail size={18} style={{ marginRight: 8 }} />
                Email
              </div>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="Nhập email nhận link cấp mật khẩu"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: 15,
                  border: '1px solid #e5e6eb',
                  borderRadius: 6,
                  outline: 'none',
                  color: '#222',
                  background: '#fff',
                  marginBottom: 0,
                  fontWeight: 400,
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#4096ff',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                fontSize: 16,
                fontWeight: 500,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                marginBottom: 24
              }}
            >
              {isSubmitting ? (
                <>
                  <Spinner animation="border" size="sm" style={{ marginRight: 8 }} />
                  Đang gửi...
                </>
              ) : 'Gửi yêu cầu'}
            </button>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: 15
            }}>
              <Link
                to="/login"
                style={{
                  color: '#888',
                  textDecoration: 'none'
                }}
              >
                ← Quay lại đăng nhập
              </Link>
              <Link
                to="/register"
                style={{
                  color: '#4096ff',
                  fontWeight: 500,
                  textDecoration: 'none'
                }}
              >
                Đăng ký tài khoản
              </Link>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default ForgotPassword;

import React, { useState } from "react";
import {
  Breadcrumb,
  Container,
  Form,
  Row,
  Button
} from "react-bootstrap";

import { Lock, KeyFill, ShieldCheck, ExclamationTriangleFill } from "react-bootstrap-icons";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from '../../utils/axiosConfig';
import { toast } from "react-toastify";
import "../../styles/enhancedForms.css";

const ChangePassword = () => {
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [reNewPass, setReNewPass] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const username = localStorage.getItem("username");
  const nav = useNavigate();

  const handleUpdate = () => {
    if (!oldPass || !newPass || !reNewPass) {
      toast.error("Vui lòng điền đầy đủ thông tin!");
      return;
    }
    if (newPass !== reNewPass) {
      toast.error("Mật khẩu mới không khớp!");
      return;
    }
    if (oldPass === newPass && oldPass === reNewPass) {
      toast.error("Mật khẩu mới phải khác mật khẩu hiện tại");
      return;
    }

    setIsSubmitting(true);

    axiosInstance
      .put(`/users/changepass/${username}`, {
        oldPassword: oldPass,
        newPassword: newPass,
      })
      .then((response) => {
        setIsSubmitting(false);
        if (response.data.status) {
          toast.success("Đổi mật khẩu thành công!");
          setOldPass("");
          setNewPass("");
          setReNewPass("");
          nav("/");
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        setIsSubmitting(false);
        console.log(error.message);
        toast.error(
          error.response
            ? error.response.data.message
            : "Đổi mật khẩu thất bại!"
        );
      });
  };

  return (
    <Container fluid className="change-password-container" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)', minHeight: '100vh' }}>
      <Row>
        <div className="custom-breadcrumb">
          <Breadcrumb>
            <Breadcrumb.Item href="/">Trang chủ</Breadcrumb.Item>
            <Breadcrumb.Item active>Thay đổi mật khẩu</Breadcrumb.Item>
          </Breadcrumb>
        </div>
      </Row>
      
      <Row className="justify-content-center align-items-center min-vh-100">
        <div className="col-11 col-md-6 col-lg-4">
          <div className="modern-form-container" style={{
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.08)',
            overflow: 'hidden',
            padding: '0.75rem'
          }}>
            <div className="modern-form-inner" style={{
              padding: '0.75rem'
            }}>
              <div className="modern-form-header" style={{ marginBottom: '0.5rem' }}>
                <div className="text-center" style={{ marginBottom: '0.5rem' }}>
                  <div style={{ 
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #3d98ff 0%, #0072ff 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto',
                    marginBottom: '0.5rem',
                    boxShadow: '0 4px 8px rgba(0, 114, 255, 0.2)'
                  }}>
                    <ShieldCheck size={18} color="white" />
                  </div>
                  <h3 style={{ 
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: '#2d3748',
                    marginBottom: '0.25rem'
                  }}>
                    Thay đổi mật khẩu
                  </h3>
                  <p style={{ 
                    fontSize: '0.85rem',
                    color: '#718096',
                    marginBottom: '0.5rem'
                  }}>
                    Cập nhật mật khẩu mới để bảo vệ tài khoản của bạn tốt hơn
                  </p>
                </div>
              </div>
              
              <Form className="mt-2">
                <Form.Group className="mb-2" controlId="oldPassword">
                  <Form.Label className="d-flex align-items-center fw-semibold mb-1" style={{ fontSize: '0.85rem', color: '#2d3748' }}>
                    <Lock className="me-1" size={14} /> Mật khẩu hiện tại
                  </Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Nhập mật khẩu hiện tại"
                    value={oldPass}
                    onChange={(e) => setOldPass(e.target.value)}
                    required
                    disabled={isSubmitting}
                    style={{
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0',
                      padding: '0.4rem 0.75rem',
                      height: '34px',
                      fontSize: '0.85rem',
                      boxShadow: 'none'
                    }}
                  />
                </Form.Group>
                
                <Form.Group className="mb-2" controlId="newPassword">
                  <Form.Label className="d-flex align-items-center fw-semibold mb-1" style={{ fontSize: '0.85rem', color: '#2d3748' }}>
                    <KeyFill className="me-1" size={14} /> Mật khẩu mới
                  </Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Nhập mật khẩu mới"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    required
                    disabled={isSubmitting}
                    style={{
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0',
                      padding: '0.4rem 0.75rem',
                      height: '34px',
                      fontSize: '0.85rem',
                      boxShadow: 'none'
                    }}
                  />
                </Form.Group>
                
                <Form.Group className="mb-2" controlId="confirmPassword">
                  <Form.Label className="d-flex align-items-center fw-semibold mb-1" style={{ fontSize: '0.85rem', color: '#2d3748' }}>
                    <KeyFill className="me-1" size={14} /> Xác nhận mật khẩu
                  </Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Nhập lại mật khẩu mới"
                    value={reNewPass}
                    onChange={(e) => setReNewPass(e.target.value)}
                    required
                    disabled={isSubmitting}
                    style={{
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0',
                      padding: '0.4rem 0.75rem',
                      height: '34px',
                      fontSize: '0.85rem',
                      boxShadow: 'none'
                    }}
                  />
                </Form.Group>
                
                <div className="text-center mt-2 mb-2">
                  <Button
                    type="submit"
                    className="w-100"
                    variant="primary"
                    disabled={isSubmitting}
                    style={{
                      borderRadius: '6px',
                      padding: '0.4rem 1rem',
                      height: '36px',
                      fontWeight: '600',
                      fontSize: '0.85rem',
                      background: 'linear-gradient(to right, #4a6cf7, #4a90e2)',
                      border: 'none',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                      transition: 'all 0.2s ease',
                      opacity: isSubmitting ? '0.7' : '1',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                        <span>Đang xử lý...</span>
                      </>
                    ) : 'Cập nhật mật khẩu'}
                  </Button>
                </div>
                
                <div className="text-center mb-2">
                  <Link to="/" className="text-decoration-none" style={{ fontSize: '0.8rem', color: '#4a5568' }}>
                    <i className="bi bi-arrow-left me-1"></i>
                    Quay về trang chủ
                  </Link>
                </div>
                
                <div className="modern-form-divider" style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  margin: '0.75rem 0',
                  color: '#a0aec0'
                }}>
                  <div style={{ flex: '1', height: '1px', background: '#e2e8f0' }}></div>
                  <span className="modern-form-divider-text" style={{ padding: '0 0.5rem', fontSize: '0.8rem' }}>hướng dẫn</span>
                  <div style={{ flex: '1', height: '1px', background: '#e2e8f0' }}></div>
                </div>
                
                <div className="d-flex gap-2 mb-2">
                  <div style={{ 
                    flex: 1,
                    padding: '0.5rem',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '6px',
                    border: '1px solid #e9ecef',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)'
                  }}>
                    <h6 style={{
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      color: '#2d3748',
                      marginBottom: '0.25rem',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <KeyFill className="me-1 text-primary" size={12} /> Tạo mật khẩu mạnh
                    </h6>
                    <ul style={{
                      paddingLeft: '1rem',
                      marginBottom: '0',
                      fontSize: '0.75rem',
                      color: '#4a5568'
                    }}>
                      <li style={{ marginBottom: '0.15rem' }}>Độ dài ít nhất 8 ký tự</li>
                      <li style={{ marginBottom: '0.15rem' }}>Kết hợp chữ hoa, chữ thường, số</li>
                      <li>Tránh thông tin cá nhân dễ đoán</li>
                    </ul>
                  </div>
                  
                  <div style={{ 
                    flex: 1,
                    padding: '0.5rem',
                    backgroundColor: 'rgba(254, 240, 199, 0.5)',
                    borderRadius: '6px',
                    border: '1px solid rgba(251, 211, 141, 0.5)',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start'
                    }}>
                      <ExclamationTriangleFill style={{
                        color: '#ed8936',
                        marginRight: '0.25rem',
                        marginTop: '0.1rem',
                        flexShrink: 0,
                        fontSize: '0.8rem'
                      }} />
                      <div>
                        <h6 style={{
                          fontSize: '0.8rem',
                          fontWeight: '700',
                          color: '#744210',
                          marginBottom: '0.15rem'
                        }}>Lưu ý quan trọng</h6>
                        <p style={{
                          fontSize: '0.75rem',
                          color: '#744210',
                          margin: 0,
                          lineHeight: 1.3
                        }}>
                          Không chia sẻ mật khẩu với bất kỳ ai, kể cả nhân viên PetCare.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-center mt-2 mb-2">
                  <Button
                    variant="primary"
                    className="w-100"
                    onClick={handleUpdate}
                    disabled={isSubmitting}
                    style={{
                      borderRadius: '6px',
                      padding: '0.4rem 1rem',
                      height: '36px',
                      fontWeight: '600',
                      fontSize: '0.85rem',
                      background: 'linear-gradient(to right, #4a6cf7, #4a90e2)',
                      border: 'none',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                      transition: 'all 0.2s ease',
                      opacity: isSubmitting ? '0.7' : '1',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                        <span>Đang xử lý...</span>
                      </>
                    ) : 'Cập nhật mật khẩu'}
                  </Button>
                </div>
                
                <div className="text-center mb-2">
                  <Link to="/" className="text-decoration-none" style={{ fontSize: '0.8rem', color: '#4a5568' }}>
                    <i className="bi bi-arrow-left me-1"></i>
                    Quay về trang chủ
                  </Link>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </Row>
    </Container>
  );
};

export default ChangePassword;

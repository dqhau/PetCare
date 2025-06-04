import React, { useState, useEffect } from 'react';
import '../../styles/contact.css';
import '../../styles/components.css'; // Import shared components CSS
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaCheck, FaTimes } from '../../utils/IconProvider';
import { Container, Row, Col, Breadcrumb } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Contact = () => {
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    phone: '',
    subject: '',
    message: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const messageRef = useState(null);
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    // Required fields
    if (!formData.email) newErrors.email = 'Email là bắt buộc';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email không hợp lệ';
    
    if (!formData.fullName) newErrors.fullName = 'Họ tên là bắt buộc';
    if (!formData.subject) newErrors.subject = 'Chủ đề là bắt buộc';
    if (!formData.message) newErrors.message = 'Nội dung là bắt buộc';
    
    // Phone validation (optional)
    if (formData.phone && !/^[0-9]{10,11}$/.test(formData.phone.replace(/[\s-]/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  /**
   * Gửi dữ liệu form liên hệ trực tiếp từ component
   * @param {Object} formData - Dữ liệu form liên hệ
   * @returns {Promise<Object>} Kết quả gửi form
   */
  const sendContactFormData = async (formData) => {
    try {
      // Giả lập gửi thành công (sử dụng khi chưa có Google Form thực tế)
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Form data submitted (simulated):', formData);
      
      
      return { success: true, message: 'Thông tin liên hệ đã được gửi thành công!' };
    } catch (error) {
      console.error('Lỗi khi gửi form liên hệ:', error);
      return { success: false, message: error.message || 'Có lỗi xảy ra khi gửi form liên hệ' };
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      setSubmitStatus(null);
      
      try {
        // Gọi hàm sendContactFormData trực tiếp trong component
        const result = await sendContactFormData(formData);
        
        if (result.success) {
          setSubmitStatus('success');
          toast.success('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong vòng 24 giờ');
          
          // Reset form after success
          setFormData({
            email: '',
            fullName: '',
            phone: '',
            subject: '',
            message: ''
          });
          
          // Scroll to message
          if (messageRef.current) {
            messageRef.current.scrollIntoView({ behavior: 'smooth' });
          }
        } else {
          throw new Error(result.message || 'Có lỗi khi gửi form liên hệ');
        }
      } catch (error) {
        console.error('Error submitting form:', error);
        setSubmitStatus('error');
        toast.error(error.message || 'Có lỗi xảy ra. Vui lòng thử lại sau');
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  // Reset status after some time
  useEffect(() => {
    if (submitStatus) {
      const timer = setTimeout(() => {
        setSubmitStatus(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [submitStatus]);
  
  return (
    <div className="contact-page">
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
      <Container>
        <Row>
          <Col>
            <div className="custom-breadcrumb">
              <Breadcrumb>
                <Breadcrumb.Item href="/">Trang chủ</Breadcrumb.Item>
                <Breadcrumb.Item active>Liên hệ</Breadcrumb.Item>
              </Breadcrumb>
            </div>
          </Col>
        </Row>

        {/* Header section */}
        <div className="contact-header">
          <h1>Liên Hệ Với Chúng Tôi</h1>
          <p>Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn</p>
          <div className="header-arrow"></div>
        </div>
      
        {/* Main content container */}
        <div className="contact-container">
          {/* Left column - Contact Information */}
          <div className="contact-info">
          <h2>Thông tin liên hệ</h2>
          
          <div className="info-item">
            <div className="info-icon"><FaMapMarkerAlt color="white" /></div>
            <div className="info-content">
              <h3>Địa chỉ</h3>
              <p>55 ngõ 155 Nguyễn Khang, Cầu Giấy</p>
            </div>
          </div>
          
          <div className="info-item">
            <div className="info-icon"><FaPhone color="white" /></div>
            <div className="info-content">
              <h3>Điện thoại</h3>
              <p>Hotline: 1900 1234</p>
              <p>Di động: 0901 234 567</p>
            </div>
          </div>
          
          <div className="info-item">
            <div className="info-icon"><FaEnvelope color="white" /></div>
            <div className="info-content">
              <h3>Email</h3>
              <p>haudaoquang7@gmail.com</p>
              <p>support@petcare.vn</p>
            </div>
          </div>
          
          <div className="info-item">
            <div className="info-icon"><FaClock color="white" /></div>
            <div className="info-content">
              <h3>Giờ làm việc</h3>
              <p>Thứ 2-6: 8:00-18:00</p>
              <p>Thứ 7-CN: 9:00-17:00</p>
            </div>
          </div>
        </div>
        
        {/* Right column - Contact Form */}
        <div className="contact-form-container">
          <h2>Gửi tin nhắn</h2>
          <p className="form-subtitle">Điền thông tin bên dưới và chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất</p>
          
          {submitStatus === 'success' && (
            <div className="message-box success" ref={messageRef}>
              <FaCheck className="message-icon" /> Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong vòng 24 giờ
            </div>
          )}
          
          {submitStatus === 'error' && (
            <div className="message-box error" ref={messageRef}>
              <FaTimes className="message-icon" /> Có lỗi xảy ra. Vui lòng thử lại sau
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="contact-form">
            <div className="enhanced-form-group">
              <label htmlFor="email">Email <span className="required">*</span></label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="example@email.com"
                value={formData.email}
                onChange={handleChange}
                disabled={isSubmitting}
                className={`enhanced-form-control ${errors.email ? 'error' : ''}`}
                required
              />
              {errors.email && <div className="error-message">{errors.email}</div>}
            </div>
            
            <div className="enhanced-form-group">
              <label htmlFor="fullName">Họ tên <span className="required">*</span></label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                placeholder="Nguyễn Văn A"
                value={formData.fullName}
                onChange={handleChange}
                disabled={isSubmitting}
                className={`enhanced-form-control ${errors.fullName ? 'error' : ''}`}
                required
              />
              {errors.fullName && <div className="error-message">{errors.fullName}</div>}
            </div>
            
            <div className="enhanced-form-group">
              <label htmlFor="phone">Số điện thoại</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                placeholder="0901 234 567"
                value={formData.phone}
                onChange={handleChange}
                disabled={isSubmitting}
                className={`enhanced-form-control ${errors.phone ? 'error' : ''}`}
              />
              {errors.phone && <div className="error-message">{errors.phone}</div>}
            </div>
            
            <div className="enhanced-form-group">
              <label htmlFor="subject">Chủ đề <span className="required">*</span></label>
              <input
                type="text"
                id="subject"
                name="subject"
                placeholder="Tư vấn dịch vụ"
                value={formData.subject}
                onChange={handleChange}
                disabled={isSubmitting}
                className={`enhanced-form-control ${errors.subject ? 'error' : ''}`}
                required
              />
              {errors.subject && <div className="error-message">{errors.subject}</div>}
            </div>
            
            <div className="enhanced-form-group">
              <label htmlFor="message">Tin Nhắn <span className="required">*</span></label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                className={`enhanced-form-control ${errors.message ? 'error' : ''}`}
                placeholder="Nhập nội dung tin nhắn"
              ></textarea>
              {errors.message && <span className="error-message">{errors.message}</span>}
            </div>
            
            <button type="submit" className="enhanced-button gradient-button submit-button" disabled={isSubmitting}>
              {isSubmitting && <span className="spinner"></span>}
              {isSubmitting ? 'Đang gửi...' : 'Gửi tin nhắn'}
            </button>
          </form>
        </div>
      </div>
      </Container>
    </div>
  );
};

export default Contact;
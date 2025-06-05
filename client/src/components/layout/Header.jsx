import React, { useEffect, useState } from "react";
import { Col, Container, Row, Dropdown } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import images from "../../assets/images/pet-logo-main.png";
import "primeicons/primeicons.css";

import {
  ArrowRepeat,
  BoxArrowInRight,
  Calendar,
  PersonVcard,
  SendFill,
} from "react-bootstrap-icons";
import NotificationSystem from "../ui/NotificationSystem";
import { FaPaw } from "../../utils/IconProvider";
import axiosInstance from "../../utils/axiosConfig";

const Header = ({ isLoggedIn, setIsLoggedIn }) => {
  const nav = useNavigate();
  const role = localStorage.getItem("role");
  const fullname = localStorage.getItem("fullname");
  const [services, setServices] = useState([]);

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.clear();
    nav("/");
  };



  useEffect(() => {
    axiosInstance
      .get("/service")
      .then((res) => setServices(res.data))
      .catch((err) => console.log(err));
  }, []);

  const handleBookingClick = () => {
    nav("/online-booking");
  };

  return (
    <div className="header-container" style={{
      borderBottom: '1px solid #e0e0e0',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      padding: '5px 0',
      backgroundColor: '#ffffff',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      width: '100%'
    }}>
      <Container fluid className="px-3 py-1">
        <Row className="align-items-center" style={{ minHeight: '60px' }}>
          <Col xs={12} md={2} className="d-flex justify-content-center justify-content-md-start">
            <Link to={"/"}>
              <img
                src={images}
                alt="PetCare Logo"
                style={{ maxWidth: '130px', height: 'auto' }}
              />
            </Link>
          </Col>

          <Col xs={12} md={7} className="d-flex justify-content-center">
            <nav>
              <ul className="list-unstyled d-flex justify-content-between m-0 nav-links" style={{
                gap: '20px',
                fontSize: '0.95rem'
              }}>
                <li>
                  <Link to="/" style={{ color: "#2a3977", fontWeight: "600" }}>
                    Trang chủ
                  </Link>
                </li>

                <li>
                  <Dropdown>
                    <Dropdown.Toggle
                      variant="link"
                      id="dropdown-services"
                      style={{ color: "#2a3977", fontWeight: "600", padding: '0' }}
                    >
                      Dịch vụ
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      {services.map((s) => (
                        <Dropdown.Item key={s._id} href="/#" style={{ fontSize: '0.9rem' }}>
                          {s.name}
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  </Dropdown>
                </li>
                
                <li>
                  <Link to="/contact" style={{ color: "#2a3977", fontWeight: "600" }}>
                    Liên hệ
                  </Link>
                </li>

                {isLoggedIn && role === "admin" && (
                  <li>
                    <Link to="/dashboard" style={{ color: "#2a3977", fontWeight: "600" }}>
                      Quản Lý
                    </Link>
                  </li>
                )}
                
                <li>
                  {isLoggedIn ? (
                    <Dropdown>
                      <Dropdown.Toggle
                        variant="link"
                        id="dropdown-settings"
                        style={{ color: "#2a3977", fontWeight: "600", padding: '0' }}
                      >
                        {fullname}
                      </Dropdown.Toggle>
                      <Dropdown.Menu style={{ fontSize: '0.9rem' }}>
                        <Dropdown.Item href="/changepass">
                          <ArrowRepeat style={{ fontSize: "16px", marginRight: "8px" }} />
                          Thay đổi mật khẩu
                        </Dropdown.Item>
                        <Dropdown.Item href="/profile">
                          <PersonVcard style={{ fontSize: "16px", marginRight: "8px" }} />
                          Thông tin cá nhân
                        </Dropdown.Item>
                        <Dropdown.Item href="/pets">
                          <FaPaw style={{ fontSize: "16px", marginRight: "8px", color: "#273172" }} />
                          Thú cưng của tôi
                        </Dropdown.Item>
                        {/* Đã xóa mục Lịch sử tiêm phòng */}
                        <Dropdown.Item href="/my-bookings">
                          <Calendar style={{ fontSize: "16px", marginRight: "8px" }} />
                          Lịch hẹn của tôi
                        </Dropdown.Item>
                        <Dropdown.Item onClick={handleLogout}>
                          <BoxArrowInRight style={{ fontSize: "16px", marginRight: "8px" }} />
                          Đăng xuất
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  ) : (
                    <Link to="/login" style={{ color: "#2a3977", fontWeight: "600" }}>
                      Đăng nhập
                    </Link>
                  )}
                </li>
              </ul>
            </nav>
          </Col>

          <Col xs={12} md={3} className="d-flex justify-content-center justify-content-md-end mt-2 mt-md-0">
            <div className="d-flex align-items-center">
              {isLoggedIn && (
                <div className="me-2">
                  <NotificationSystem />
                </div>
              )}
              <button
                onClick={handleBookingClick}
                className="btn btn-sm btn-dark d-flex align-items-center rounded-pill"
                style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
              >
                <span>Đặt lịch Online</span>
                <SendFill className="ms-1" style={{ fontSize: '0.75rem' }} />
              </button>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Header;

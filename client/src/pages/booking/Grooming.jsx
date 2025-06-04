import React from "react";
import { Container, Row, Col, Card, Breadcrumb } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/layout/Footer";

const Grooming = () => {
  const navigate = useNavigate();

  const groomingServices = [
    {
      id: 1,
      title: "Cắt tỉa lông cơ bản",
      description: "Dịch vụ cắt tỉa lông cơ bản cho thú cưng, phù hợp với mọi giống chó mèo",
      price: "150.000đ - 300.000đ",
      duration: "60-90 phút",
      suitable: "Mọi giống chó và mèo"
    },
    {
      id: 2,
      title: "Cắt tỉa lông cao cấp",
      description: "Dịch vụ cắt tỉa lông theo kiểu dáng yêu cầu, tạo kiểu cho thú cưng",
      price: "300.000đ - 500.000đ",
      duration: "90-120 phút",
      suitable: "Chó Poodle, Bichon, Phốc, Shih Tzu..."
    },
    {
      id: 3,
      title: "Tắm và vệ sinh",
      description: "Dịch vụ tắm, vệ sinh tai, móng, răng và tuyến hôi cho thú cưng",
      price: "150.000đ - 250.000đ",
      duration: "45-60 phút",
      suitable: "Mọi giống chó và mèo"
    },
    {
      id: 4,
      title: "Gói Spa trọn gói",
      description: "Bao gồm tắm, vệ sinh, cắt tỉa lông, dưỡng lông, mát-xa",
      price: "400.000đ - 700.000đ",
      duration: "120-180 phút",
      suitable: "Mọi giống chó và mèo"
    }
  ];

  const handleBooking = () => {
    navigate("/online-booking");
  };

  return (
    <>
      <Container fluid className="py-3">
        <Row>
          <Col>
            <Breadcrumb className="custom-breadcrumb mb-4">
              <Breadcrumb.Item href="/">Trang chủ</Breadcrumb.Item>
              <Breadcrumb.Item href="/services">Dịch vụ</Breadcrumb.Item>
              <Breadcrumb.Item active>Grooming</Breadcrumb.Item>
            </Breadcrumb>
          </Col>
        </Row>
        
        <h1 className="text-center mb-4">Dịch vụ Grooming</h1>
        <p className="text-center mb-5">
          Chúng tôi cung cấp các dịch vụ grooming chuyên nghiệp cho thú cưng của bạn. 
          Đội ngũ nhân viên được đào tạo bài bản sẽ mang đến trải nghiệm tuyệt vời cho thú cưng của bạn.
        </p>

        <Row>
          {groomingServices.map(service => (
            <Col md={6} className="mb-4" key={service.id}>
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <Card.Title>{service.title}</Card.Title>
                  <Card.Text>{service.description}</Card.Text>
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <div>
                      <p className="mb-0"><strong>Giá:</strong> {service.price}</p>
                      <p className="mb-0"><strong>Thời gian:</strong> {service.duration}</p>
                      <p className="mb-0"><strong>Phù hợp:</strong> {service.suitable}</p>
                    </div>
                  </div>
                </Card.Body>
                <Card.Footer className="bg-white border-0">
                  <button className="btn btn-primary w-100" onClick={handleBooking}>
                    Đặt lịch ngay
                  </button>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
      <Footer />
    </>
  );
};

export default Grooming;

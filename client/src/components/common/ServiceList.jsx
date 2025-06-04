import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import ServiceItem from "./serviceItem";
import { useNavigate } from "react-router-dom";

const ServiceList = () => {
  const navigate = useNavigate();

  const services = [
    {
      id: 1,
      title: "Dịch vụ tắm",
      image: require("../../assets/images/service-shower.png"),
      description: "Dịch vụ tắm cho thú cưng với các sản phẩm cao cấp, an toàn",
      price: "150.000đ - 300.000đ"
    },
    {
      id: 2,
      title: "Dịch vụ cắt tỉa lông",
      image: require("../../assets/images/service-salon.png"),
      description: "Cắt tỉa lông theo yêu cầu, tạo kiểu cho thú cưng của bạn",
      price: "200.000đ - 500.000đ"
    },
    {
      id: 3,
      title: "Dịch vụ chăm sóc",
      image: require("../../assets/images/service-care.png"),
      description: "Chăm sóc toàn diện cho thú cưng khi bạn vắng nhà",
      price: "100.000đ - 300.000đ/ngày"
    },
    {
      id: 4,
      title: "Dịch vụ hỗ trợ 24/7",
      image: require("../../assets/images/service-support-247.png"),
      description: "Tư vấn sức khỏe thú cưng và hỗ trợ khẩn cấp 24/7",
      price: "Miễn phí tư vấn"
    }
  ];

  const handleBooking = () => {
    navigate("/online-booking");
  };

  return (
    <section className="services-section py-5">
      <Container>
        <h2 className="text-center mb-5">Dịch Vụ Của Chúng Tôi</h2>
        <Row>
          {services.map((service) => (
            <Col md={6} lg={3} key={service.id} className="mb-4">
              <ServiceItem
                title={service.title}
                image={service.image}
                description={service.description}
                price={service.price}
                onBookNow={handleBooking}
              />
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default ServiceList;

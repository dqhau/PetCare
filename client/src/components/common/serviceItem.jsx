import React, { useState } from "react";
import { Card, Col, Row } from "react-bootstrap";
import { SuitHeart } from "react-bootstrap-icons";

const ServiceItem = ({ title, image, description, price, onBookNow }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card
      className="h-100"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="text-center pt-3">
        <Card.Img
          variant="top"
          src={image}
          style={{
            width: "auto",
            height: "120px",
            objectFit: "contain"
          }}
        />
      </div>
      <Card.Body className="d-flex flex-column">
        <Card.Title className="text-center">{title}</Card.Title>
        <Card.Text>{description}</Card.Text>
        <div className="mt-auto">
          <p className="text-primary font-weight-bold">{price}</p>
          <Card.Link 
            href="#"
            className="w-100"
          >
            Đặt Lịch Ngay
          </Card.Link>
        </div>
        {isHovered && (
          <div className="heart-icon position-absolute" style={{ top: "10px", right: "10px" }}>
            <SuitHeart />
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default ServiceItem;

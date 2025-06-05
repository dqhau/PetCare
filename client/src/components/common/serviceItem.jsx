import React, { useState } from "react";
import { Card } from "react-bootstrap";
import { SuitHeart } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";

const ServiceItem = ({ title, image, description, price, onBookNow }) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  return (
    <Card
      className="h-100"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => navigate("/online-booking")}
      style={{ cursor: "pointer" }}
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
            onClick={(e) => {
              e.stopPropagation();
              onBookNow();
            }}
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

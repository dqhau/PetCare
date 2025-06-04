import React from 'react';
import { Spinner, Container } from 'react-bootstrap';

const Loading = ({ message = "Đang tải dữ liệu..." }) => {
  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
      <div className="text-center">
        <Spinner animation="border" role="status" variant="primary" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Đang tải...</span>
        </Spinner>
        <p className="mt-3">{message}</p>
      </div>
    </Container>
  );
};

export default Loading;

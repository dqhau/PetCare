import React from 'react';
import { Breadcrumb } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import '../../styles/components.css';

const PageBreadcrumb = ({ items }) => {
  return (
    <div className="custom-breadcrumb">
      <Breadcrumb>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>
          Trang chủ
        </Breadcrumb.Item>
        {items.map((item, index) => (
          <Breadcrumb.Item 
            key={index}
            active={index === items.length - 1}
            linkAs={index !== items.length - 1 ? Link : undefined}
            linkProps={index !== items.length - 1 ? { to: item.path } : undefined}
          >
            {item.label}
          </Breadcrumb.Item>
        ))}
      </Breadcrumb>
    </div>
  );
};

export default PageBreadcrumb;

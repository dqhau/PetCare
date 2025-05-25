import React from "react";
import { Col, Row } from "react-bootstrap";
import Header from "../components/Header.jsx";
import Banner from "../components/Banner.jsx";
import ServiceItem from "../components/serviceItem.jsx";
import Footer from "../components/Footer.jsx"; // Import Footer component

const HomePage = () => {
  return (
    <div>
      <Banner></Banner>
      <ServiceItem></ServiceItem>
      <Footer></Footer> 
    </div>
  );
};

export default HomePage;

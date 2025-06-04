import React from "react";
import Banner from "../../components/layout/Banner";
import Footer from "../../components/layout/Footer";
import ServiceList from "../../components/common/ServiceList";

const HomePage = () => {
  return (
    <div className="home-page">
      <Banner />
      <ServiceList />
      <Footer />
    </div>
  );
};

export default HomePage;

import React, { useState, useEffect } from "react";
import { Container, Row } from "react-bootstrap";
import StatCards from "./Chart/StartCard";
import TopSellingTable from "./Chart/TopSellingTable";
import StatCards2 from "./Chart/StatCards2";
import { Grid, Typography } from "@mui/material";
import MonthlyBookingChart from "./Chart/MonthlyBookingChart";
import axios from "axios";

const TotalDashBoard = () => {
  const [dashboardStats, setDashboardStats] = useState({
    totalBookings: 0,
    bookingsByStatus: {
      pending: 0,
      processing: 0,
      completed: 0,
      cancelled: 0
    },
    totalUsers: 0,
    totalServices: 0
  });
  
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await axios.get('http://localhost:9999/statistics/dashboard');
        setDashboardStats(response.data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };
    
    fetchDashboardStats();
  }, []);
  
  return (
    <Container fluid>
      <Row style={{ marginLeft: "20px", width: "95%", marginTop: "20px" }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          Thống kê tổng quan
        </Typography>
        
        {/* Stat Cards - Top row with 4 cards */}
        <StatCards />
        
        {/* Monthly Charts */}
        <MonthlyBookingChart />
        
        {/* Bottom Section */}
        <Grid container spacing={3}>
          {/* Popular Services Table */}
          <Grid item xs={12} md={7}>
            <TopSellingTable />
          </Grid>
          
          {/* Booking Status Cards */}
          <Grid item xs={12} md={5}>
            <StatCards2 />
          </Grid>
        </Grid>
      </Row>
    </Container>
  );
};

export default TotalDashBoard;

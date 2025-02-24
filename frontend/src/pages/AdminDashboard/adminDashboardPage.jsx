import React from "react";
import AdminDashboard from "../../components/adminDashboard/adminDashboard";
import Header from "../../components/adminDashboard/adminHeader"; 
import Sidebar from "../../components/adminDashboard/adminSidebar"; 
import "./admindashboardpage.css"

const AdminDashboardPage = () => {
  return (
    <div className="admin-dashboard-container">
      <Header />
      <div className="dashboard-layout">
        <Sidebar />
        <div className="dashboard-content">
          <AdminDashboard />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;

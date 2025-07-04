// src/pages/AdminPage.js
import React from "react";
import { useAuth } from '../context/AuthContext';
import { useNavigate } from "react-router-dom";

export default function AdminPage() {
  const { authUser } = useAuth();
  const navigate = useNavigate();

  // Only allow users with role 'admin'
  if (!authUser || authUser.role !== "admin") {
    return (
      <div style={{ padding: "2rem" }}>
        <h2>Access Denied</h2>
        <p>You do not have permission to view this page.</p>
        <button onClick={() => navigate("/")}>Back to Home</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Admin Dashboard</h1>
      <p>Welcome, {authUser.username}! Here are your admin controls.</p>
      {/* Add admin features here */}
    </div>
  );
}

import React, { useState } from "react";
import { useAuth } from '../context/AuthContext';
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import { GET_USERS, DELETE_USER, UPDATE_USER } from "../graphql/userQueries";
import '../styles/AdminPage.css';

export default function AdminPage() {
  const { authUser } = useAuth();
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useQuery(GET_USERS);
  const [deleteUser] = useMutation(DELETE_USER, { onCompleted: () => refetch() });
  const [editUser] = useMutation(UPDATE_USER, { onCompleted: () => refetch() });

  // Edit state
  const [editId, setEditId] = useState(null);
  const [editUsername, setEditUsername] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editName, setEditName] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editRole, setEditRole] = useState("");

  if (!authUser || authUser.role !== "admin") {
    return (
      <div className="admin-container">
        <h2>Access Denied</h2>
        <p>You do not have permission to view this page.</p>
        <button className="admin-back-btn" onClick={() => navigate("/")}>Back to Home</button>
      </div>
    );
  }

  if (loading) return <div className="admin-container">Loading...</div>;
  if (error) return <div className="admin-container" style={{ color: "red" }}>{error.message}</div>;

  const users = (data?.getUsers || []).filter(u => u.role !== "admin");

  const startEdit = (user) => {
    setEditId(user._id);
    setEditUsername(user.username || "");
    setEditEmail(user.email || "");
    setEditName(user.name || "");
    setEditAddress(user.address || "");
    setEditPhone(user.phone || "");
    setEditRole(user.role || "");
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditUsername("");
    setEditEmail("");
    setEditName("");
    setEditAddress("");
    setEditPhone("");
    setEditRole("");
  };

  const saveEdit = async (userId) => {
    await editUser({
      variables: {
        id: userId,
        username: editUsername,
        email: editEmail,
        name: editName,
        address: editAddress,
        phone: editPhone,
        role: editRole
      }
    });
    cancelEdit();
  };

  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      await deleteUser({ variables: { id: userId } });
    }
  };

  return (
    <div className="admin-container">
      {/* Back Button */}
      <button className="admin-back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <h1 className="admin-title">Admin Dashboard</h1>
      <p>Welcome, {authUser.username}! Here are your admin controls.</p>

      <h2 className="admin-users-title">All Users</h2>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Name</th>
              <th>Address</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id}>
                <td>
                  {editId === user._id ? (
                    <input value={editUsername} onChange={e => setEditUsername(e.target.value)} />
                  ) : user.username}
                </td>
                <td>
                  {editId === user._id ? (
                    <input value={editEmail} onChange={e => setEditEmail(e.target.value)} />
                  ) : user.email}
                </td>
                <td>
                  {editId === user._id ? (
                    <input value={editName} onChange={e => setEditName(e.target.value)} />
                  ) : user.name}
                </td>
                <td>
                  {editId === user._id ? (
                    <input value={editAddress} onChange={e => setEditAddress(e.target.value)} />
                  ) : user.address}
                </td>
                <td>
                  {editId === user._id ? (
                    <input value={editPhone} onChange={e => setEditPhone(e.target.value)} />
                  ) : user.phone}
                </td>
                <td>
                  {editId === user._id ? (
                    <select value={editRole} onChange={e => setEditRole(e.target.value)}>
                      <option value="user">user</option>
                      <option value="seller">seller</option>
                    </select>
                  ) : user.role}
                </td>
                <td>
                  {editId === user._id ? (
                    <>
                      <button className="admin-save-btn" onClick={() => saveEdit(user._id)}>Save</button>
                      <button className="admin-cancel-btn" onClick={cancelEdit}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button className="admin-edit-btn" onClick={() => startEdit(user)}>Edit</button>
                      <button className="admin-delete-btn" onClick={() => handleDelete(user._id)}>Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

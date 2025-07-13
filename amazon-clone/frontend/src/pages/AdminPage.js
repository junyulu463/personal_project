import React, { useState } from "react";
import { useAuth } from '../context/AuthContext';
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import { GET_USERS, DELETE_USER, UPDATE_USER } from "../graphql/userQueries";

export default function AdminPage() {
  const { authUser } = useAuth();
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useQuery(GET_USERS);
  const [deleteUser] = useMutation(DELETE_USER, { onCompleted: () => refetch() });
  const [editUser] = useMutation(UPDATE_USER, { onCompleted: () => refetch() });

  // More edit state
  const [editId, setEditId] = useState(null);
  const [editUsername, setEditUsername] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editName, setEditName] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editRole, setEditRole] = useState("");

  if (!authUser || authUser.role !== "admin") {
    return (
      <div style={{ padding: "2rem" }}>
        <h2>Access Denied</h2>
        <p>You do not have permission to view this page.</p>
        <button onClick={() => navigate("/")}>Back to Home</button>
      </div>
    );
  }

  if (loading) return <div style={{ padding: "2rem" }}>Loading...</div>;
  if (error) return <div style={{ padding: "2rem", color: "red" }}>{error.message}</div>;

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
    <div style={{ padding: "2rem" }}>
      <h1>Admin Dashboard</h1>
      <p>Welcome, {authUser.username}! Here are your admin controls.</p>

      <h2>All Users</h2>
      <table style={{ borderCollapse: "collapse", width: "100%", marginTop: 20 }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ccc", padding: 8 }}>Username</th>
            <th style={{ border: "1px solid #ccc", padding: 8 }}>Email</th>
            <th style={{ border: "1px solid #ccc", padding: 8 }}>Name</th>
            <th style={{ border: "1px solid #ccc", padding: 8 }}>Address</th>
            <th style={{ border: "1px solid #ccc", padding: 8 }}>Phone</th>
            <th style={{ border: "1px solid #ccc", padding: 8 }}>Role</th>
            <th style={{ border: "1px solid #ccc", padding: 8 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id}>
              <td style={{ border: "1px solid #ccc", padding: 8 }}>
                {editId === user._id ? (
                  <input value={editUsername} onChange={e => setEditUsername(e.target.value)} />
                ) : user.username}
              </td>
              <td style={{ border: "1px solid #ccc", padding: 8 }}>
                {editId === user._id ? (
                  <input value={editEmail} onChange={e => setEditEmail(e.target.value)} />
                ) : user.email}
              </td>
              <td style={{ border: "1px solid #ccc", padding: 8 }}>
                {editId === user._id ? (
                  <input value={editName} onChange={e => setEditName(e.target.value)} />
                ) : user.name}
              </td>
              <td style={{ border: "1px solid #ccc", padding: 8 }}>
                {editId === user._id ? (
                  <input value={editAddress} onChange={e => setEditAddress(e.target.value)} />
                ) : user.address}
              </td>
              <td style={{ border: "1px solid #ccc", padding: 8 }}>
                {editId === user._id ? (
                  <input value={editPhone} onChange={e => setEditPhone(e.target.value)} />
                ) : user.phone}
              </td>
              <td style={{ border: "1px solid #ccc", padding: 8 }}>
                {editId === user._id ? (
                  <select value={editRole} onChange={e => setEditRole(e.target.value)}>
                    <option value="user">user</option>
                    <option value="seller">seller</option>
                  </select>
                ) : user.role}
              </td>
              <td style={{ border: "1px solid #ccc", padding: 8 }}>
                {editId === user._id ? (
                  <>
                    <button onClick={() => saveEdit(user._id)}>Save</button>
                    <button onClick={cancelEdit} style={{ marginLeft: 8 }}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEdit(user)}>Edit</button>
                    <button onClick={() => handleDelete(user._id)} style={{ marginLeft: 8, color: "red" }}>
                      Delete
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

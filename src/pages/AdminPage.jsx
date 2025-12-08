import React, { useState, useEffect } from "react";
import {
  FaClipboardList,
  FaCheckCircle,
  FaUser,
  FaSignOutAlt,
  FaDownload,
  FaImages,
  FaTimes,
  FaHome,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import SERVER_BASE_URL from "../services/serverURL";

// --- ImageModal component remains the same ---

function AdminPage() {
  const navigate = useNavigate(); // Added useNavigate
  const [activeTab, setActiveTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrderImages, setSelectedOrderImages] = useState(null);

  const tabs = [
    { id: "orders", label: "Orders", icon: <FaClipboardList /> },
    { id: "completed", label: "Completed Orders", icon: <FaCheckCircle /> },
    { id: "users", label: "Users", icon: <FaUser /> },
    { id: "logout", label: "Logout", icon: <FaSignOutAlt /> },
  ];

  useEffect(() => {
    if (activeTab !== "orders") return;

    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${SERVER_BASE_URL}/api/orders`);
        const data = await res.json();
        setOrders(data.orders || []);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      }
      setLoading(false);
    };

    fetchOrders();
  }, [activeTab]);

  const openImageModal = (images) => setSelectedOrderImages(images);
  const closeImageModal = () => setSelectedOrderImages(null);

  const renderOrdersTable = () => {
    if (loading) return <p>Loading orders...</p>;
    if (!orders.length) return <p>No orders found.</p>;

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border">ID</th>
              <th className="p-3 border">Customer</th>
              <th className="p-3 border">Address</th>
              <th className="p-3 border">Paper</th>
              <th className="p-3 border">Total (AED)</th>
              <th className="p-3 border">Payment ID</th>
              <th className="p-3 border">Files</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id} className="text-center hover:bg-gray-50">
                <td className="p-2 border">{order._id.slice(-6)}</td>
                <td className="p-2 border">
                  {order.name}
                  <br />
                  <span className="text-sm text-gray-500">{order.phone}</span>
                </td>
                <td className="p-2 border">{`${order.street}, ${order.city}, ${order.emirate}`}</td>
                <td className="p-2 border">{order.paperType}</td>
                <td className="p-2 border font-semibold">{order.totalAmount}</td>
                <td className="p-2 border">{order.paymentId}</td>
                <td className="p-2 border">
                  <button
                    onClick={() => openImageModal(order.images)}
                    className="text-blue-600 hover:text-blue-800 transition flex items-center justify-center gap-1 text-lg mx-auto"
                    title={`View and Download ${order.images.length} files`}
                  >
                    <FaImages />
                    <span className="text-sm">({order.images.length})</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "orders":
        return renderOrdersTable();
      case "completed":
        return <div>Completed orders will be displayed here</div>;
      case "users":
        return <div>Users management will be displayed here</div>;
      case "logout":
        return <div>Logging out...</div>;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-6 font-bold text-2xl border-b border-gray-200">
          Admin Panel
        </div>
        <ul className="mt-4">
          {tabs.map((tab) => (
            <li
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-100 transition ${
                activeTab === tab.id ? "bg-gray-200 font-semibold" : ""
              }`}
            >
              {tab.icon} {tab.label}
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-semibold capitalize">{activeTab}</h1>
          {/* Go to Home Button */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <FaHome /> Home
          </button>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-md">{renderContent()}</div>
      </div>

      {/* Image Modal Render */}
      {selectedOrderImages && <ImageModal images={selectedOrderImages} onClose={closeImageModal} />}
    </div>
  );
}

export default AdminPage;

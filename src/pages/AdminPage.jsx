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

import SERVER_BASE_URL from "../services/serverURL";
import { useNavigate } from "react-router";

// --- 1. Modal Component (Inline) ---
const ImageModal = ({ images, onClose }) => {
  if (!images || images.length === 0) return null;

  const handleDownload = (fullUrl, name) => {
    const link = document.createElement("a");
    link.href = fullUrl;
    link.download = name || "image.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  console.log(images);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            Order Images ({images.length} Files)
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* Modal Content - Image Grid */}
        <div className="p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {images.map((img, idx) => {
            const fullImageUrl = `${SERVER_BASE_URL}/${img.path}`;

            return (
              <div
                key={idx}
                className="flex flex-col items-center border rounded-lg p-2 bg-gray-50"
              >
                <img
                  src={fullImageUrl}
                  alt={img.originalname || `image-${idx}`}
                  className="w-full h-32 object-cover rounded-md mb-2"
                />
                <p className="text-xs text-gray-700 text-center mb-1">
                  Size : {img._doc.size} Quantity : {img._doc.quantity}
                </p>
                <button
                  onClick={() => window.open(fullImageUrl, "_blank")}
                  className="w-full bg-blue-500 text-white py-1 rounded-md text-sm hover:bg-blue-600 transition flex items-center justify-center gap-1"
                >
                  <FaDownload /> View
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// --- 2. AdminPage Component ---
function AdminPage() {
    const navigate = useNavigate()
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

  const openImageModal = (images) => {
    setSelectedOrderImages(images);
  };

  const closeImageModal = () => {
    setSelectedOrderImages(null);
  };

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
                <td className="p-2 border font-semibold">
                  {order.totalAmount}
                </td>

                <td className="p-2 border">{order.paymentId}</td>

                {/* Files button to open modal */}
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
        // Add actual logout logic here
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
            <h1 className="text-3xl font-semibold mb-6 capitalize">{activeTab}</h1>
            {/* Go to Home Button */}
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <FaHome /> Home
              </button>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md">
          {renderContent()}
        </div>
      </div>

      {/* Image Modal Render */}
      {selectedOrderImages && (
        <ImageModal images={selectedOrderImages} onClose={closeImageModal} />
      )}
    </div>
  );
}

export default AdminPage;

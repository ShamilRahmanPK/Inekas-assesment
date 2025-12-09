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

// --- Image Modal ---
const ImageModal = ({ images, onClose }) => {
  if (!images || images.length === 0) return null;

  return (
<div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-lg border border-gray-200">
        {/* Header */}
        <div className="sticky top-0 bg-white p-4 border-b border-gray-300 flex justify-between items-center">
          <h2 className="text-xl font-bold text-black">
            Order Images ({images.length} Files)
          </h2>
          <button onClick={onClose} className="text-black hover:text-gray-700">
            <FaTimes size={24} />
          </button>
        </div>

        {/* Images Grid */}
        <div className="p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {images.map((img, idx) => {
            const fullImageUrl = `${SERVER_BASE_URL}/${img.path}`;
            return (
              <div
                key={idx}
                className="flex flex-col items-center border border-gray-200 p-2 bg-white hover:shadow-md transition"
              >
                <img
                  src={fullImageUrl}
                  alt={img.originalname || `image-${idx}`}
                  className="w-full h-32 object-cover mb-2 border border-gray-200"
                />
                <p className="text-xs text-gray-700 text-center mb-1">
                  Size: {img._doc?.size} | Qty: {img._doc?.quantity}
                </p>
                <button
                  onClick={() => window.open(fullImageUrl, "_blank")}
                  className="w-full bg-white text-black border border-gray-300 py-1 text-sm hover:bg-gray-100 transition flex items-center justify-center gap-1"
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

// --- Order Details Modal ---
const OrderDetailsModal = ({ order, onClose, onViewImages }) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-lg border border-gray-200 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 border-b border-gray-300 pb-2">
          <h2 className="text-xl font-bold text-black">Order Details</h2>
          <button onClick={onClose} className="text-black hover:text-gray-700">
            <FaTimes size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-2 text-gray-800">
          <p><strong>Customer:</strong> {order.name}</p>
          <p><strong>Phone:</strong> {order.phone}</p>
          <p><strong>Address:</strong> {order.street}, {order.city}, {order.emirate}</p>
          <p><strong>Paper:</strong> {order.paperType}</p>
          <p><strong>Total:</strong> AED {order.totalAmount}</p>
          <p><strong>Payment ID:</strong> {order.paymentId}</p>
        </div>

        {/* View Images Button */}
        <button
          onClick={() => onViewImages(order.images)}
          className="mt-4 w-full bg-white text-black border border-gray-300 py-2 hover:bg-gray-100 transition flex items-center justify-center gap-2 font-medium shadow-sm hover:shadow-md"
        >
          <FaImages /> View Images ({order.images.length})
        </button>
      </div>
    </div>
  );
};

// --- AdminPage Component ---
function AdminPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrderImages, setSelectedOrderImages] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

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

  const openOrderDetails = (order) => setSelectedOrder(order);
  const closeOrderDetails = () => setSelectedOrder(null);

  // --- Render folder-like order cards ---
  const renderOrdersFolders = () => {
    if (loading) return <p>Loading orders...</p>;
    if (!orders.length) return <p>No orders found.</p>;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {orders.map((order) => (
          <div
            key={order._id}
            className="bg-white text-gray-900 border border-gray-200 shadow-md p-6 cursor-pointer hover:shadow-lg transition flex flex-col justify-between"
            onClick={() => openOrderDetails(order)}
          >
            {/* Order Info */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <FaClipboardList size={26} className="text-black" />
                <h3 className="text-lg font-semibold text-black">
                  Order {order._id.slice(-6)}
                </h3>
              </div>
              <p className="text-gray-700 mb-1">
                <span className="font-medium text-gray-900">Customer:</span> {order.name}
              </p>
              <p className="text-gray-700 mb-1">
                <span className="font-medium text-gray-900">Phone:</span> {order.phone}
              </p>
              <p className="text-gray-700 mb-1">
                <span className="font-medium text-gray-900">Address:</span> {order.street}, {order.city}, {order.emirate}
              </p>
              <p className="text-gray-700 mb-1">
                <span className="font-medium text-gray-900">Total:</span> AED {order.totalAmount}
              </p>
            </div>

            {/* Button at the bottom */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                openImageModal(order.images);
              }}
              className="mt-4 w-full bg-white text-black py-2 border border-gray-300 hover:bg-gray-100 transition-all flex items-center justify-center gap-2 font-medium shadow-sm hover:shadow-md"
            >
              <FaImages /> View Files ({order.images.length})
            </button>
          </div>
        ))}
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "orders":
        return renderOrdersFolders();
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
        <div className="p-6 font-bold text-2xl border-b border-gray-200">Admin Panel</div>
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
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white hover:bg-gray-800 transition"
          >
            <FaHome /> Home
          </button>
        </div>

        <div className="bg-white p-6 shadow-md">{renderContent()}</div>
      </div>

      {/* Modals */}
      {selectedOrderImages && <ImageModal images={selectedOrderImages} onClose={closeImageModal} />}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={closeOrderDetails}
          onViewImages={openImageModal}
        />
      )}
    </div>
  );
}

export default AdminPage;

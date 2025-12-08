import { useLocation, useNavigate } from "react-router-dom";

export default function Success() {
  const { state } = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center p-10 bg-gray-50 rounded-lg shadow">
        <h1 className="text-3xl font-bold text-green-600">
          Payment Successful ✅
        </h1>
        <p className="mt-3 text-gray-600">
          Payment ID: {state?.paymentId}
        </p>
        <p className="mt-2">Thank you for your order.</p>

        {/* Buttons */}
        <div className="mt-6 flex justify-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Go to Home
          </button>
          <button
            onClick={() => navigate("/admin")}
            className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition"
          >
            Go to Admin
          </button>
        </div>
      </div>
    </div>
  );
}

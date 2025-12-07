import { useLocation } from "react-router-dom";

export default function Success() {
  const { state } = useLocation();

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
      </div>
    </div>
  );
}

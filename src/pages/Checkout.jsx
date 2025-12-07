import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const paypalRef = useRef(null);

  const order = location.state;

  const [address, setAddress] = useState({
    name: "",
    phone: "",
    street: "",
    city: "",
    emirate: "",
  });

  const [imagePreviews, setImagePreviews] = useState([]);

  const AEDtoUSD = 0.27;
  const totalAmountUSD = order ? (order.totalAmount * AEDtoUSD).toFixed(2) : "0";

  useEffect(() => {
    if (!order) navigate("/upload-photos");
  }, [order, navigate]);

  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };


  useEffect(() => {
    if (!order?.images) return;

    const previews = order.images
      .map((imgObj) => {
        if (!imgObj) return null;

        if (imgObj.url) return imgObj.url;

        if (imgObj.file instanceof File || imgObj.file instanceof Blob) {
          return URL.createObjectURL(imgObj.file);
        }

        return null;
      })
      .filter(Boolean);

    setImagePreviews(previews);

    return () => {
      previews.forEach((url) => {
        if (url.startsWith("blob:")) URL.revokeObjectURL(url);
      });
    };
  }, [order]);

  useEffect(() => {
    if (!window.paypal || !order || paypalRef.current.children.length > 0) return;

    window.paypal
      .Buttons({
        style: { layout: "vertical", color: "gold", shape: "rect", label: "paypal" },
        createOrder: (_, actions) =>
          actions.order.create({
            purchase_units: [
              {
                amount: { value: totalAmountUSD, currency_code: "USD" },
                description: `Photo order - AED ${order.totalAmount}`,
              },
            ],
          }),
        onApprove: async (_, actions) => {
          const details = await actions.order.capture();
          navigate("/success", { state: { order, address, paymentId: details.id } });
        },
        onError: (err) => console.error("PayPal Checkout Error:", err),
      })
      .render(paypalRef.current);
  }, [order, address, navigate, totalAmountUSD]);

  if (!order) return null;

  return (
    <div className="min-h-screen bg-white px-6 py-12">
      <h1 className="text-3xl font-serif mb-6">Delivery & Payment</h1>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Address */}
        <div className="bg-gray-50 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Delivery Address</h2>
          <div className="space-y-4">
            {["name", "phone", "street", "city", "emirate"].map((field) => (
              <input
                key={field}
                name={field}
                placeholder={field.toUpperCase()}
                value={address[field]}
                onChange={handleChange}
                className="w-full p-3 border rounded"
              />
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-gray-50 p-6 rounded-lg shadow flex flex-col items-start">
          <h2 className="text-xl font-semibold mb-4 self-start">Order Summary</h2>

          <p>Size: {order.size}</p>
          <p>Paper: {order.paperType}</p>
          <p>Material: {order.materialType}</p>
          <p>Images: {order.images.length}</p>

          {/* Image Previews */}
          <div className="flex gap-2 mt-2 overflow-x-auto self-end">
            {imagePreviews.map((src, idx) => (
              <img
                key={idx}
                src={src}
                alt={`preview-${idx}`}
                className="w-16 h-16 object-cover rounded border"
              />
            ))}
          </div>

          <p className="text-2xl font-bold text-green-600 mt-4">
            AED {order.totalAmount}
          </p>

          {/* PayPal btn */}
          <div className="mt-6 w-full" ref={paypalRef}></div>
        </div>
      </div>
    </div>
  );
}

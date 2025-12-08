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
    <div className="min-h-screen bg-white px-6 lg:px-16 py-12">
      <h1 className="text-3xl md:text-4xl font-serif mb-10">Delivery & Payment</h1>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Address Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-[0_6px_20px_rgba(0,0,0,0.06)]">
          <h2 className="text-xl font-semibold mb-6">Delivery Address</h2>

          <div className="space-y-5">
            {["name", "phone", "street", "city", "emirate"].map((field) => (
              <input
                key={field}
                name={field}
                placeholder={field.toUpperCase()}
                value={address[field]}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:border-black outline-none transition"
              />
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-[0_6px_20px_rgba(0,0,0,0.06)] flex flex-col">
          <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

          <div className="space-y-1 text-gray-700">
            <p><span className="font-semibold">Size:</span> {order.size}</p>
            <p><span className="font-semibold">Paper:</span> {order.paperType}</p>
            <p><span className="font-semibold">Material:</span> {order.materialType}</p>
            <p><span className="font-semibold">Images:</span> {order.images.length}</p>
          </div>

          {/* Preview Images */}
          <div className="flex gap-2 mt-4 overflow-x-auto py-2">
            {imagePreviews.map((src, idx) => (
              <img
                key={idx}
                src={src}
                alt={`preview-${idx}`}
                className="w-16 h-16 object-cover rounded-lg border border-gray-300"
              />
            ))}
          </div>

          <div className="mt-6">
            <p className="text-3xl font-semibold text-green-600">
              AED {order.totalAmount}
            </p>
            <p className="text-sm text-gray-600">Converted: USD {totalAmountUSD}</p>
          </div>

          {/* PayPal Button */}
          <div className="mt-8 w-full" ref={paypalRef}></div>
        </div>
      </div>
    </div>
  );
}

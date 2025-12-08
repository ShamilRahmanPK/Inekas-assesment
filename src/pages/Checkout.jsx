import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const paypalRef = useRef(null);

  const order = location.state;
  const deliveryCharge = 29; 

  const [address, setAddress] = useState({
    name: "",
    phone: "",
    street: "",
    city: "",
    emirate: "",
  });

  const [imagePreviews, setImagePreviews] = useState([]);
  const [isAddressComplete, setIsAddressComplete] = useState(false);
  const [paypalMounted, setPaypalMounted] = useState(false);

  const AEDtoUSD = 0.27;
  const totalAmountAED = order ? order.totalAmount + deliveryCharge : 0;


  useEffect(() => {
    if (!order) navigate("/upload-photos");
  }, [order, navigate]);


  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };


  useEffect(() => {
    const allFilled = Object.values(address).every((val) => val.trim() !== "");
    setIsAddressComplete(allFilled);
  }, [address]);

  // Generate image previews
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

  // PayPal button setup
  useEffect(() => {
    if (!window.paypal || !order || paypalRef.current.children.length > 0) return;

    window.paypal
      .Buttons({
        style: {
          layout: "vertical",
          color: "gold",
          shape: "rect",
          label: "paypal",
        },
        createOrder: (_, actions) =>
          actions.order.create({
            purchase_units: [
              {
                amount: {
                  value: (totalAmountAED * AEDtoUSD).toFixed(2),
                  currency_code: "USD",
                },
                description: `Photo order - AED ${totalAmountAED}`,
              },
            ],
          }),
        onApprove: async (_, actions) => {
          const details = await actions.order.capture();
          navigate("/success", {
            state: { order, address, paymentId: details.id },
          });
        },
        onError: (err) => console.error("PayPal Checkout Error:", err),
      })
      .render(paypalRef.current)
      .then(() => setPaypalMounted(true));
  }, [order, address, navigate, totalAmountAED]);

  if (!order) return null;

  return (
    <div className="min-h-screen bg-gray-50 px-6 lg:px-16 py-12">
      <div className="flex items-center justify-between mb-10">
  <h1 className="text-3xl md:text-4xl font-serif">
    Checkout
  </h1>
  <img
    src={logo}
    alt="Logo"
    className="w-32 md:w-40 object-contain"
  />
</div>


      <div className="grid md:grid-cols-2 gap-10">
        {/* ADDRESS FORM */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
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
          <p className="mt-4 text-sm text-gray-500">
            Delivery charge of <b>AED {deliveryCharge}</b> will be added to your
            order.
          </p>
        </div>

        {/* ORDER SUMMARY */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 flex flex-col">
          <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

          {/* Order details */}
          <div className="space-y-1 text-gray-700">
            <div className="mt-2">
              <span className="font-semibold">Sizes & Quantities:</span>
              <ul className="list-disc list-inside text-gray-600">
                {order.images.map((img, idx) => (
                  <li key={idx}>
                    {img.size} x {img.quantity}
                  </li>
                ))}
              </ul>
            </div>

            <p>
              <span className="font-semibold">Paper:</span> {order.paperType}
            </p>
            <p>
              <span className="font-semibold">Images:</span> {order.images.length}
            </p>
          </div>

          {/* Image previews */}
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

          {/* Pricing */}
          <div className="mt-6 border-t pt-4 border-gray-200">
            <div className="flex justify-between text-gray-700 mb-1">
              <span>Subtotal:</span>
              <span>AED {order.totalAmount}</span>
            </div>
            <div className="flex justify-between text-gray-700 mb-1">
              <span>Delivery:</span>
              <span>AED {deliveryCharge}</span>
            </div>
            <div className="flex justify-between text-green-600 text-2xl font-semibold mt-2">
              <span>Total:</span>
              <span>AED {totalAmountAED}</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Converted: USD {(totalAmountAED * AEDtoUSD).toFixed(2)}
            </p>
          </div>

          {/* PayPal */}
          <div className="relative mt-8 w-full">
            <div
              ref={paypalRef}
              className={`transition-opacity duration-300 ${
                paypalMounted && !isAddressComplete ? "opacity-50" : ""
              }`}
            ></div>

            {paypalMounted && !isAddressComplete && (
              <div
                className="absolute inset-0 bg-transparent cursor-not-allowed"
                title="Please fill all address fields to enable payment"
              ></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

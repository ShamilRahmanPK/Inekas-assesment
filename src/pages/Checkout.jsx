import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import SERVER_BASE_URL from "../services/serverURL";

// Leaflet
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icon issue in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const paypalRef = useRef(null);

  // Modal control
  const [openMap, setOpenMap] = useState(false);

  const [mapLocation, setMapLocation] = useState({
    lat: 25.2048,
    lng: 55.2708, // Dubai default
  });

  // Order info
  const [order, setOrder] = useState(() => {
    const locOrder = location.state;
    if (locOrder) {
      localStorage.setItem("currentOrder", JSON.stringify(locOrder));
      return locOrder;
    }
    const saved = localStorage.getItem("currentOrder");
    return saved ? JSON.parse(saved) : null;
  });

  // Address fields
  const [address, setAddress] = useState({
    name: "",
    phone: "",
    street: "",
    city: "",
    emirate: "",
    locationURL: "",
    lat: mapLocation.lat,
    lng: mapLocation.lng,
  });

  const deliveryCharge = 29;
  const AEDtoUSD = 0.27;
  const totalAmountAED = order ? order.totalAmount + deliveryCharge : 0;

  const [imagePreviews, setImagePreviews] = useState([]);
  const [isAddressComplete, setIsAddressComplete] = useState(false);
  const [paypalMounted, setPaypalMounted] = useState(false);

  const BACKEND_URL = SERVER_BASE_URL;

  // auto redirect if no order
  useEffect(() => {
    if (!order) navigate("/upload-photos");
  }, [order, navigate]);

  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    const allFilled = Object.values(address)
      .filter((_, i) => i < 5) // Only first 5 fields: name, phone, street, city, emirate
      .every((val) => val.trim() !== "");
    setIsAddressComplete(allFilled);
  }, [address]);

  // preview images
  useEffect(() => {
    if (!order?.images) return;
    const previews = order.images
      .map((imgObj) => {
        if (!imgObj) return null;
        if (imgObj.file instanceof File || imgObj.file instanceof Blob) {
          return URL.createObjectURL(imgObj.file);
        }
        if (imgObj.url) return imgObj.url;
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

  // submit order
  const handleSubmitOrder = async (paymentId = "DEMO_PAYMENT_ID") => {
    if (!order) return;

    const formData = new FormData();

    formData.append("paperType", order.paperType);
    formData.append("totalAmount", totalAmountAED);

    formData.append("discountPercent", order.discountPercent || 0);
    formData.append("promoCode", order.promoCode || "");

    order.images.forEach((img, index) => {
      if (img.file) {
        formData.append("images", img.file, img.file.name);
      } else if (img.url) {
        formData.append("imageUrls", img.url);
      }
      formData.append(`quantity_${index}`, img.quantity);
      formData.append(`size_${index}`, img.size);
    });

    Object.entries(address).forEach(([key, value]) => {
      formData.append(key, value);
    });

    if (paymentId) formData.append("paymentId", paymentId);

    try {
      const res = await fetch(`${BACKEND_URL}/api/order`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.removeItem("currentOrder");
        navigate("/success", { state: { order, address, paymentId } });
      } else {
        console.error("Order failed:", data);
        alert("Order submission failed.");
      }
    } catch (err) {
      console.error("Error submitting order:", err);
      alert("Network error.");
    }
  };

  // PayPal button
  useEffect(() => {
    if (
      !window.paypal ||
      !order ||
      (paypalRef.current && paypalRef.current.children.length > 0)
    )
      return;

    window.paypal
      .Buttons({
        style: {
          layout: "vertical",
          color: "gold",
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
          handleSubmitOrder(details.id);
        },
      })
      .render(paypalRef.current)
      .then(() => setPaypalMounted(true));
  }, [order, totalAmountAED]);

  if (!order) return null;

  // === Leaflet Map Click Component ===
  function LocationMarker({ setLocation, mapLocation }) {
    const map = useMap();

    useEffect(() => {
      map.invalidateSize(); // Fix map rendering in modal
    }, [map]);

    useMapEvents({
      click: async (e) => {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;

        // Reverse geocode using Nominatim
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
          );
          const data = await res.json();
          const addr = data.address || {};

          setLocation({
            street: addr.road || addr.pedestrian || "",
            city: addr.city || addr.town || addr.village || "",
            emirate: addr.state || "UAE",
            locationURL: `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=18/${lat}/${lng}`,
            lat,
            lng,
          });
        } catch (err) {
          console.error("Reverse geocoding error:", err);
          setLocation({
            street: "Unknown Street",
            city: "Unknown City",
            emirate: "UAE",
            locationURL: `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=18/${lat}/${lng}`,
            lat,
            lng,
          });
        }
      },
    });

    return <Marker position={[mapLocation.lat, mapLocation.lng]} />;
  }

  return (
    <>
      {/* ===================== FULL SCREEN MAP MODAL ===================== */}
      {openMap && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-[9999] flex flex-col">
          <div className="flex justify-between p-4 bg-white shadow">
            <h2 className="text-lg font-semibold">Select Delivery Location</h2>
            <button
              onClick={() => setOpenMap(false)}
              className="text-red-500 font-bold text-lg"
            >
              ✕
            </button>
          </div>

          <div className="flex-1">
            <MapContainer
              center={[mapLocation.lat, mapLocation.lng]}
              zoom={14}
              style={{ width: "100%", height: "100%" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <LocationMarker
                mapLocation={mapLocation}
                setLocation={(loc) => setAddress((prev) => ({ ...prev, ...loc }))}
              />
            </MapContainer>
          </div>

          <button
            onClick={() => setOpenMap(false)}
            className="bg-green-600 text-white py-4 text-xl"
          >
            Confirm this Location
          </button>
        </div>
      )}

      {/* ===================== MAIN CHECKOUT PAGE ===================== */}
      <div className="min-h-screen bg-gray-50 px-6 lg:px-16 py-12">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-3xl md:text-4xl font-serif">Checkout</h1>
          <img src={logo} alt="Logo" className="w-32 md:w-40 object-contain" />
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
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-black"
                />
              ))}
            </div>

            <button
              onClick={() => setOpenMap(true)}
              className="mt-5 w-full bg-black text-white py-3 rounded-lg"
            >
              Select Location on Map
            </button>
          </div>

          {/* ORDER SUMMARY */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 flex flex-col">
            <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

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
            </div>

            <div className="flex gap-2 mt-4 overflow-x-auto py-2">
              {imagePreviews.map((src, idx) => (
                <img
                  key={idx}
                  src={src}
                  className="w-16 h-16 object-cover border"
                />
              ))}
            </div>

            {/* Total */}
            <div className="mt-6 border-t pt-4 border-gray-200">
              <div className="flex justify-between mb-1">
                <span>Subtotal:</span>
                <span>AED {order.totalAmount}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span>Delivery:</span>
                <span>AED {deliveryCharge}</span>
              </div>

              <div className="flex justify-between text-green-600 text-2xl font-semibold mt-2">
                <span>Total:</span>
                <span>AED {totalAmountAED}</span>
              </div>

              <p className="text-sm text-gray-500 mt-1">
                USD {(totalAmountAED * AEDtoUSD).toFixed(2)}
              </p>
            </div>

            {/* PayPal */}
            <div className="relative mt-8 w-full">
              <div ref={paypalRef}></div>

              {paypalMounted && !isAddressComplete && (
                <div className="absolute inset-0 bg-transparent cursor-not-allowed"></div>
              )}
            </div>

            {/* Demo */}
            <button
              disabled={!isAddressComplete}
              onClick={() => handleSubmitOrder("DEMO_PAYMENT_ID")}
              className="mt-6 bg-blue-600 text-white py-3 text-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Demo Payment
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

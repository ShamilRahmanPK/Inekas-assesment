// UploadPhotos.jsx
import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Cropper } from "react-advanced-cropper";
import "react-advanced-cropper/dist/style.css";
import { MdUndo } from "react-icons/md";
import logo from "../assets/logo.png";

export default function UploadPhotos({ onNext }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { size: initialSize, paperType: initialPaperType } = location.state || {};

  // DEFAULTS
  const [defaultSize, setDefaultSize] = useState(initialSize || "4X6");
  const [paperType, setPaperType] = useState(initialPaperType || "Luster");

  const sizes = ["3.5X5", "4X6", "5X7", "8X10", "4X4", "8X8"];
  const papers = ["Luster", "Glossy"];
  const quantities = [1, 5, 10, 20, 30, 40, 50];

  const [images, setImages] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);

  // Promo
  const [promoCode, setPromoCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoMessage, setPromoMessage] = useState("");

  // Crop modal
  const [editingImage, setEditingImage] = useState(null);
  const cropperRef = useRef(null);

  // PRICE
  const priceBySize = {
    "3.5X5": 3,
    "4X6": 5,
    "5X7": 7,
    "8X10": 10,
    "4X4": 4,
    "8X8": 12,
  };

  const calculateImagePrice = (imgSize, quantity = 1) => {
    let price = priceBySize[imgSize] || 5;
    if (paperType === "Glossy") price += 2;
    return price * quantity;
  };

  useEffect(() => {
    const total = images.reduce(
      (sum, img) => sum + calculateImagePrice(img.size, img.quantity),
      0
    );
    const discountedTotal = total - (total * discountPercent) / 100;
    setTotalAmount(discountedTotal);
  }, [images, paperType, discountPercent]);

  // PROMO CODE
  const handleApplyPromo = () => {
    const code = promoCode.toUpperCase();
    if (code === "HALFOFF") {
      setDiscountPercent(50);
      setPromoMessage("50% discount applied!");
    } else if (code === "FREE") {
      setDiscountPercent(100);
      setPromoMessage("100% discount applied!");
    } else if (code === "QUARTER") {
      setDiscountPercent(25);
      setPromoMessage("25% discount applied!");
    } else {
      setDiscountPercent(0);
      setPromoMessage("Invalid promo code.");
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map((file) => ({
      id: `${file.name}-${file.size}-${Date.now()}`,
      file,
      size: defaultSize,
      quantity: 1,
      originalPreview: URL.createObjectURL(file),
      editedPreview: null,
    }));
    setImages((prev) => [...prev, ...previews]);
  };

  const removeImage = (index) =>
    setImages((prev) => prev.filter((_, i) => i !== index));

  const openEditModal = (img) => {
    setEditingImage(img);
  };

  const applyEdit = () => {
    if (!editingImage || !cropperRef.current) return;

    const canvas = cropperRef.current.getCanvas();
    const croppedImage = canvas.toDataURL("image/jpeg");

    setImages((prev) =>
      prev.map((img) =>
        img.id === editingImage.id
          ? { ...img, editedPreview: croppedImage }
          : img
      )
    );
    setEditingImage(null);
  };

  const revertImage = (id) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, editedPreview: null } : img))
    );
  };

  const getAspect = (s) => {
    switch (s) {
      case "3.5X5":
        return 3.5 / 5;
      case "4X6":
        return 4 / 6;
      case "5X7":
        return 5 / 7;
      case "8X10":
        return 8 / 10;
      case "4X4":
      case "8X8":
        return 1;
      default:
        return 4 / 6;
    }
  };

  const goToAddressPage = () => {
    navigate("/checkout", {
      state: {
        images,
        paperType,
        totalAmount,
        discountPercent,
        promoCode: discountPercent ? promoCode : null,
      },
    });
  };

  return (
    <div className="bg-white min-h-screen px-4 md:px-10 py-10 pb-40">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-4xl font-serif mb-6 text-left">
          Upload Photos
        </h1>
        <img
          src={logo}
          alt="Logo"
          className="w-32 md:w-40 object-contain"
        />
      </div>

      <div className="flex flex-col md:flex-row gap-10">
        {/* LEFT */}
        <div className="flex-1">
          <label className="w-full h-[200px] md:h-[220px] border-2 border-dashed border-gray-400 flex flex-col items-center justify-center cursor-pointer hover:border-black transition shadow-sm hover:shadow-md">
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            <p className="text-sm tracking-widest">UPLOAD PHOTOS</p>
          </label>

          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
              {images.map((img, index) => (
                <div
                  key={img.id}
                  className="relative overflow-hidden shadow-md bg-gray-100 p-2"
                >
                  <div
                    style={{ aspectRatio: getAspect(img.size) }}
                    className="overflow-hidden cursor-pointer"
                    onClick={() => openEditModal(img)}
                  >
                    <img
                      src={img.editedPreview || img.originalPreview}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-black text-white text-xs px-2 py-1"
                  >
                    ✕
                  </button>

                  {img.editedPreview && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        revertImage(img.id);
                      }}
                      className="absolute top-2 left-2 bg-black text-white text-xs px-2 py-1"
                    >
                      <MdUndo size={18} />
                    </button>
                  )}

                  <div className="p-2">
                    <select
                      value={img.size}
                      onChange={(e) =>
                        setImages((prev) =>
                          prev.map((item) =>
                            item.id === img.id
                              ? { ...item, size: e.target.value }
                              : item
                          )
                        )
                      }
                      className="mt-2 w-full border text-sm px-2 py-1"
                    >
                      {sizes.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>

                    <p className="text-xs my-2">Quantity</p>
                    <select
                      value={img.quantity}
                      onChange={(e) =>
                        setImages((prev) =>
                          prev.map((item) =>
                            item.id === img.id
                              ? { ...item, quantity: Number(e.target.value) }
                              : item
                          )
                        )
                      }
                      className="w-full border text-sm px-2 py-1"
                    >
                      {quantities.map((q) => (
                        <option key={q} value={q}>
                          {q}
                        </option>
                      ))}
                    </select>

                    <p className="text-xs text-gray-600 mt-1">
                      Price: <b>AED {calculateImagePrice(img.size, img.quantity)}</b>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT PANEL */}
        <div className="w-full md:w-[350px] flex flex-col gap-6">
          <div className="p-6 border bg-gray-50 shadow space-y-6">
            <div>
              <p className="font-semibold mb-2">Default Size</p>
              <div className="flex flex-wrap gap-3">
                {sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setDefaultSize(s)}
                    className={`px-4 py-2 border text-sm ${
                      defaultSize === s
                        ? "bg-black text-white"
                        : "bg-white border-gray-300"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="font-semibold mb-2">Paper Type</p>
              <div className="flex flex-wrap gap-3">
                {papers.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPaperType(p)}
                    className={`px-4 py-2 border text-sm ${
                      paperType === p
                        ? "bg-black text-white"
                        : "bg-white border-gray-300"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* PROMO CODE */}
          <div className="flex flex-col gap-2">
            <div className="flex gap-3 items-center">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Enter promo code"
                className="flex-1 border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              />
              <button
                onClick={handleApplyPromo}
                className="bg-black text-white px-4 py-2 font-semibold hover:bg-gray-900"
              >
                APPLY
              </button>
            </div>
            {discountPercent ? (
              <p className="text-sm text-green-600">
                Promo applied: <b>{promoCode} - {discountPercent}% off</b>
              </p>
            ) : null}
            {promoMessage && <p className="text-xs text-gray-500">{promoMessage}</p>}
          </div>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="fixed bottom-0 left-0 w-full bg-gray-100 px-4 md:px-10 py-4 border-t shadow-[0_-3px_8px_rgba(0,0,0,0.15)] z-50">
        <div className="max-w-[1200px] mx-auto flex justify-between items-center">
          <h2 className="text-xl font-bold">
            Total Amount: <span className="text-green-600">AED {totalAmount}</span>
            <span className="text-xs text-gray-500 ml-2">
              + Delivery charge AED 29 applies within UAE
            </span>
          </h2>
          <button
            disabled={images.length === 0}
            onClick={goToAddressPage}
            className="bg-black text-white px-6 py-3 disabled:opacity-50"
          >
            NEXT
          </button>
        </div>
      </div>

      {/* EDIT MODAL */}
      {editingImage && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white shadow-xl w-full max-w-3xl overflow-hidden border border-gray-200">
            {/* Close Button */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-end">
              <button
                onClick={() => setEditingImage(null)}
                className="text-gray-500 hover:text-black text-2xl"
              >
                &times;
              </button>
            </div>

            {/* Cropper */}
            <div className="relative w-full h-[320px] md:h-[420px] bg-gray-50 flex items-center justify-center">
              <Cropper
                ref={cropperRef}
                src={editingImage.editedPreview || editingImage.originalPreview}
                stencilProps={{ aspectRatio: getAspect(editingImage.size) }}
                className="w-full h-full"
              />
            </div>

            {/* Action Buttons */}
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setEditingImage(null)}
                className="px-5 py-2 border border-gray-300 text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={applyEdit}
                className="px-5 py-2 bg-black text-white hover:bg-gray-900 shadow-md"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

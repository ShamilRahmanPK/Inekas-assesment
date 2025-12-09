import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Cropper } from "react-advanced-cropper";
import "react-advanced-cropper/dist/style.css";
import { MdUndo } from "react-icons/md";
import logo from "../assets/logo.png";

export default function UploadPhotos() {
  const navigate = useNavigate();
  const location = useLocation();
  const { size: initialSize, paperType: initialPaperType } = location.state || {};

  const [defaultSize, setDefaultSize] = useState(initialSize || "4X6");
  const [paperType, setPaperType] = useState(initialPaperType || "Luster");

  const sizes = ["3.5X5", "4X6", "5X7", "8X10", "4X4", "8X8"];
  const papers = ["Luster", "Glossy"];
  const quantities = [1, 5, 10, 20, 30, 40, 50];

  const [images, setImages] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [promoCode, setPromoCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoMessage, setPromoMessage] = useState("");

  const [editingImage, setEditingImage] = useState(null);
  const cropperRef = useRef(null);

  const priceBySize = {
    "3.5X5": 3,
    "4X6": 5,
    "5X7": 7,
    "8X10": 10,
    "4X4": 4,
    "8X8": 12,
  };

  const calculateImagePrice = (imgSize, quantity) => {
    let price = priceBySize[imgSize] || 5;
    if (paperType === "Glossy") price += 2;
    return price * quantity;
  };

  // Total amount calculation
  useEffect(() => {
    const total = images.reduce(
      (sum, img) => sum + calculateImagePrice(img.size, img.quantity),
      0
    );
    const discounted = total - (total * discountPercent) / 100;
    setTotalAmount(discounted);
  }, [images, paperType, discountPercent]);

  // Promo code
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

  // Upload images
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const mapped = files.map((file) => ({
      id: `${file.name}-${file.size}-${Date.now()}`,
      size: defaultSize,
      quantity: 1,
      originalFile: file,
      editedFile: null,
      previewURL: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...mapped]);
  };

  const removeImage = (index) => setImages((prev) => prev.filter((_, i) => i !== index));
  const openEditModal = (img) => setEditingImage(img);

  const canvasToFile = async (canvas, filename) => {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        const file = new File([blob], filename, { type: "image/jpeg" });
        resolve(file);
      }, "image/jpeg");
    });
  };

  const applyEdit = async () => {
    if (!editingImage || !cropperRef.current) return;
    const canvas = cropperRef.current.getCanvas();
    if (!canvas) return;

    const editedFile = await canvasToFile(canvas, editingImage.originalFile.name);
    const previewURL = URL.createObjectURL(editedFile);

    setImages((prev) =>
      prev.map((img) =>
        img.id === editingImage.id ? { ...img, editedFile, previewURL } : img
      )
    );
    setEditingImage(null);
  };

  const revertImage = (id) => {
    setImages((prev) =>
      prev.map((img) =>
        img.id === id
          ? { ...img, editedFile: null, previewURL: URL.createObjectURL(img.originalFile) }
          : img
      )
    );
  };

  const getAspect = (s) => {
    switch (s) {
      case "3.5X5": return 3.5 / 5;
      case "4X6": return 4 / 6;
      case "5X7": return 5 / 7;
      case "8X10": return 8 / 10;
      case "4X4":
      case "8X8": return 1;
      default: return 4 / 6;
    }
  };

  // Navigate to checkout with only edited images
  const goToAddressPage = () => {
    const imagesToSend = images
      .filter((img) => img.editedFile) 
      .map((img) => ({
        id: img.id,
        size: img.size,
        quantity: img.quantity,
        file: img.editedFile,
      }));

    if (imagesToSend.length === 0) {
      alert("Please crop at least one image before proceeding.");
      return;
    }

    navigate("/checkout", {
      state: {
        images: imagesToSend,
        paperType,
        totalAmount,
        discountPercent,
        promoCode,
      },
    });
  };

  const allEdited = images.every((img) => img.editedFile); 

  return (
    <div className="bg-white min-h-screen px-4 md:px-10 py-10 pb-40">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-serif mb-6 text-left">Upload Photos</h1>
        <img src={logo} alt="Logo" className="w-32 md:w-40 object-contain" />
      </div>

      {/* Instructions */}
      <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-sm text-yellow-800 rounded">
        <p><strong>Instructions:</strong></p>
        <ul className="list-disc list-inside mt-2">
          <li>Upload your photos using the "UPLOAD PHOTOS" button.</li>
          <li>Select the size and quantity for each photo.</li>
          <li>Choose your preferred paper type.</li>
          <li>Click on an image to crop it before proceeding.</li>
          <li><strong>Note:</strong> The "NEXT" button will be enabled only after all images have been cropped.</li>
          <li>You can apply a promo code if available.</li>
        </ul>
      </div>

      <div className="flex flex-col md:flex-row gap-10">
        {/* LEFT */}
        <div className="flex-1">
          <label className="w-full h-[200px] md:h-[220px] border-2 border-dashed border-gray-400 flex flex-col items-center justify-center cursor-pointer hover:border-black transition shadow-sm hover:shadow-md">
            <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
            <p className="text-sm tracking-widest">UPLOAD PHOTOS</p>
          </label>

          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
              {images.map((img, index) => (
                <div 
                  key={img.id} 
                  className={`relative overflow-hidden shadow-md bg-gray-100 p-2 rounded-md ${!img.editedFile ? 'border-2 border-red-400' : ''}`}
                >
                  <div
                    style={{ aspectRatio: getAspect(img.size) }}
                    className="overflow-hidden cursor-pointer relative"
                    onClick={() => openEditModal(img)}
                  >
                    <img src={img.previewURL} className="w-full h-full object-cover rounded-md" />
                  </div>

                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-black text-white text-xs px-2 py-1 rounded"
                  >
                    ✕
                  </button>

                  {img.editedFile && (
                    <button
                      onClick={(e) => { e.stopPropagation(); revertImage(img.id); }}
                      className="absolute top-2 left-2 bg-black text-white text-xs px-2 py-1 rounded"
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
                            item.id === img.id ? { ...item, size: e.target.value } : item
                          )
                        )
                      }
                      className="mt-2 w-full border text-sm px-2 py-1"
                    >
                      {sizes.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>

                    <p className="text-xs my-2">Quantity</p>
                    <select
                      value={img.quantity}
                      onChange={(e) =>
                        setImages((prev) =>
                          prev.map((item) =>
                            item.id === img.id ? { ...item, quantity: Number(e.target.value) } : item
                          )
                        )
                      }
                      className="w-full border text-sm px-2 py-1"
                    >
                      {quantities.map((q) => (
                        <option key={q} value={q}>{q}</option>
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

        {/* RIGHT SIDE */}
        <div className="w-full md:w-[350px] flex flex-col gap-6">
          <div className="p-6 border bg-gray-50 shadow space-y-6 rounded-md">
            <div>
              <p className="font-semibold mb-2">Default Size</p>
              <div className="flex flex-wrap gap-3">
                {sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setDefaultSize(s)}
                    className={`px-4 py-2 border text-sm ${defaultSize === s ? "bg-black text-white" : "bg-white border-gray-300"}`}
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
                    className={`px-4 py-2 border text-sm ${paperType === p ? "bg-black text-white" : "bg-white border-gray-300"}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex gap-3 items-center">
              <input type="text" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} placeholder="Enter promo code" className="flex-1 border px-3 py-2 rounded" />
              <button onClick={handleApplyPromo} className="bg-black text-white px-4 py-2 rounded">APPLY</button>
            </div>
            {promoMessage && <p className="text-xs text-gray-500">{promoMessage}</p>}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 w-full bg-gray-100 px-4 md:px-10 py-4 border-t shadow z-50">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
          <h2 className="text-xl font-bold">
            Total Amount: <span className="text-green-600">AED {totalAmount}</span>
            <span className="text-xs font-light"> + AED 29 delivery charges apply</span>
          </h2>
          
          {!allEdited && images.length > 0 && (
            <p className="text-sm text-red-600 mt-1 md:mt-0">⚠ Please crop all uploaded images to proceed.</p>
          )}
          
          <button
            disabled={images.length === 0 || !allEdited}
            onClick={goToAddressPage}
            className="bg-black text-white px-6 py-3 disabled:opacity-50 rounded mt-1 md:mt-0"
          >
            NEXT
          </button>
        </div>
      </div>

      {/* Cropper Modal */}
      {editingImage && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white shadow-xl w-full max-w-3xl border rounded-md">
            <div className="px-6 py-4 border-b flex justify-end">
              <button onClick={() => setEditingImage(null)} className="text-2xl">×</button>
            </div>

            <div className="w-full h-[320px] md:h-[420px] bg-gray-50">
              <Cropper
                ref={cropperRef}
                src={editingImage.previewURL}
                stencilProps={{ aspectRatio: getAspect(editingImage.size) }}
                className="w-full h-full"
              />
            </div>

            <div className="px-6 py-4 border-t flex justify-end gap-3">
              <button onClick={() => setEditingImage(null)} className="px-5 py-2 border rounded">Cancel</button>
              <button onClick={applyEdit} className="px-5 py-2 bg-black text-white rounded">Apply</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
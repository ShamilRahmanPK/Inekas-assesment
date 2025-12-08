import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Cropper from "react-easy-crop";
import getCroppedImg from "../tools/cropImage";
import { MdUndo } from "react-icons/md";

export default function UploadPhotos({ onNext }) {
  const navigate = useNavigate();

  const goToAddressPage = (data) => {
    navigate("/checkout", { state: data });
  };

  const location = useLocation();
  const {
    size: initialSize,
    paperType: initialPaperType,
    materialType: initialMaterialType,
  } = location.state || {};

  const [size, setSize] = useState(initialSize || "4X6");
  const [paperType, setPaperType] = useState(initialPaperType || "Luster");
  const [materialType, setMaterialType] = useState(
    initialMaterialType || "Standard"
  );

  const [images, setImages] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [orderData, setOrderData] = useState({
    size,
    paperType,
    materialType,
    images: [],
    totalAmount: 0,
  });

  const [editingImage, setEditingImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const apiKey = import.meta.env.VITE_UPSAMPLER_KEY;

  const sizes = ["3.5X5", "4X6", "5X7", "8X10", "4X4", "8X8"];
  const papers = [
    "Luster",
    "Glossy",
    "Matte",
    "Metallic",
    "Deep Matte",
    "Fine Art",
  ];
  const materials = ["Standard", "Canvas", "Metallic"];

  const getPricePerImage = () => {
    let price = 5;
    if (size === "3.5X5") price = 3;
    if (size === "4X6") price = 5;
    if (size === "5X7") price = 7;
    if (size === "8X10") price = 10;
    if (size === "4X4") price = 4;
    if (size === "8X8") price = 12;

    if (materialType === "Canvas") price += 5;
    if (paperType === "Glossy") price += 2;
    if (paperType === "Metallic") price += 3;

    return price;
  };

  useEffect(() => {
    const price = getPricePerImage();
    const total = images.length * price;
    setTotalAmount(total);
    setOrderData({ size, paperType, materialType, images, totalAmount: total });
  }, [images, size, paperType, materialType]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map((file) => ({
      id: `${file.name}-${file.size}-${Date.now()}`,
      file,
      originalPreview: URL.createObjectURL(file),
      editedPreview: null,
    }));
    setImages((prev) => [...prev, ...previews]);
  };

  const removeImage = (index) =>
    setImages(images.filter((_, i) => i !== index));

  const openEditModal = (img) => {
    setEditingImage(img);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  };

  const onCropComplete = useCallback((croppedArea, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const applyEdit = useCallback(async () => {
    if (!editingImage || !croppedAreaPixels) return;
    const croppedImage = await getCroppedImg(
      editingImage.editedPreview || editingImage.originalPreview,
      croppedAreaPixels,
      rotation
    );
    setImages((prev) =>
      prev.map((img) =>
        img.id === editingImage.id
          ? { ...img, editedPreview: croppedImage }
          : img
      )
    );
    setEditingImage(null);
  }, [editingImage, croppedAreaPixels, rotation]);

  const revertImage = (imgId) => {
    setImages((prev) =>
      prev.map((img) =>
        img.id === imgId ? { ...img, editedPreview: null } : img
      )
    );
  };

  const getAspect = () => {
    switch (size) {
      case "3.5X5":
        return 3.5 / 5;
      case "4X6":
        return 4 / 6;
      case "5X7":
        return 5 / 7;
      case "8X10":
        return 8 / 10;
      case "4X4":
        return 1;
      case "8X8":
        return 1;
      default:
        return 4 / 6;
    }
  };

  return (
    <div className="bg-white min-h-screen px-4 md:px-10 py-10 md:py-16">
      <h1 className="text-4xl font-serif mb-6 text-center md:text-left">
        Upload Photos
      </h1>

      <div className="flex flex-col md:flex-row gap-10">
        <div className="flex-1">
          <p className="font-semibold mb-3">Upload Photos</p>
          <label className="w-full h-[220px] border-2 border-dashed border-gray-400 flex flex-col items-center justify-center cursor-pointer hover:border-black rounded-lg transition shadow-sm hover:shadow-md">
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
              {images.map((img, index) => (
                <div
                  key={img.id}
                  className="relative rounded-lg overflow-hidden shadow-lg cursor-pointer group"
                  style={{ aspectRatio: getAspect() }}
                  onClick={() => openEditModal(img)}
                >
                  <img
                    src={img.editedPreview || img.originalPreview}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
                    <span className="text-white font-semibold text-sm md:text-base">
                      Edit
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(index);
                    }}
                    className="absolute top-2 right-2 bg-black text-white text-xs px-2 py-1 rounded"
                  >
                    ✕
                  </button>

                  {img.editedPreview && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        revertImage(img.id);
                      }}
                      className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white p-1 rounded-full hover:bg-opacity-90 transition"
                    >
                      <MdUndo size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 p-4 bg-gray-50 rounded-lg text-gray-600 text-sm pb-20">
            <p>
              Upload your photos here. Click on any image to edit, crop, or
              rotate it. Use the ✕ button to remove an image, and the undo icon
              to revert any changes. On the right panel, you can select the
              desired <strong>size</strong>, <strong>paper type</strong>, and{" "}
              <strong>material</strong> for your photos. The total price will
              automatically update based on your selections and the number of
              images uploaded.
            </p>
          </div>
        </div>

        <div className="w-full md:w-[350px] flex flex-col gap-6">
          <div className="p-6 border bg-gray-50 rounded-lg shadow space-y-6">
            <div>
              <p className="font-semibold mb-2">Size</p>
              <div className="flex flex-wrap gap-3">
                {sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`px-4 py-2 border rounded-lg text-sm transition ${
                      size === s
                        ? "bg-gray-100 border-black font-semibold shadow"
                        : "border-gray-300 hover:border-black"
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
                    className={`px-4 py-2 border rounded-lg text-sm transition ${
                      paperType === p
                        ? "bg-gray-100 border-black font-semibold shadow"
                        : "border-gray-300 hover:border-black"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="font-semibold mb-2">Material</p>
              <div className="flex flex-wrap gap-3">
                {materials.map((m) => (
                  <button
                    key={m}
                    onClick={() => setMaterialType(m)}
                    className={`px-4 py-2 border rounded-lg text-sm transition ${
                      materialType === m
                        ? "bg-gray-100 border-black font-semibold shadow"
                        : "border-gray-300 hover:border-black"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="fixed bottom-0 left-0 w-full bg-gray-200 z-50 px-4 md:px-10 py-4 border-t border-gray-300 shadow-[0_-3px_8px_rgba(0,0,0,0.15)]">
            <div className="max-w-[1200px] mx-auto flex justify-between items-center">
              {/* Price Info */}
              <div className="flex gap-6">
                <div>
                  <p className="text-sm text-gray-500">Price per image:</p>
                  <h2 className="text-2xl font-semibold">
                    AED {getPricePerImage()}
                  </h2>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Images:</p>
                  <h2 className="text-2xl font-semibold">{images.length}</h2>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Amount:</p>
                  <h2 className="text-3xl font-bold text-green-600">
                    {totalAmount}
                  </h2>
                </div>
              </div>

              {/* NEXT Button */}
              <button
                onClick={() => goToAddressPage(orderData)}
                disabled={images.length === 0}
                className="bg-black text-white px-6 py-3 tracking-widest text-sm disabled:opacity-50 rounded-lg shadow hover:shadow-xl transition"
              >
                NEXT
              </button>
            </div>
          </div>
        </div>
      </div>

      {editingImage && (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.15)] w-full max-w-3xl overflow-hidden border border-gray-200">

      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-xl md:text-2xl font-serif tracking-wide">Edit Image</h2>
        <button
          onClick={() => setEditingImage(null)}
          className="text-gray-500 hover:text-black text-2xl leading-none"
        >
          &times;
        </button>
      </div>

      {/* Cropper */}
      <div className="relative w-full h-[260px] md:h-[420px] bg-gray-50">
        <Cropper
          image={editingImage.editedPreview || editingImage.originalPreview}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={getAspect()}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onRotationChange={setRotation}
          onCropComplete={onCropComplete}
        />
      </div>

      {/* Controls */}
      <div className="px-6 py-5 space-y-6">

        {/* Zoom */}
        <div>
          <label className="text-sm text-gray-600">Zoom</label>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full accent-black"
          />
        </div>

        {/* Rotation */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setRotation((prev) => prev - 90)}
            className="px-4 py-2 rounded-xl border border-gray-300 hover:border-black transition"
          >
            ⟲
          </button>
          <button
            onClick={() => setRotation((prev) => prev + 90)}
            className="px-4 py-2 rounded-xl border border-gray-300 hover:border-black transition"
          >
            ⟳
          </button>
          <span className="text-sm text-gray-600">
            {rotation % 360}°
          </span>
        </div>

      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
        <button
          onClick={() => setEditingImage(null)}
          className="px-5 py-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
        >
          Cancel
        </button>
        <button
          onClick={applyEdit}
          className="px-5 py-2 rounded-xl bg-black text-white hover:bg-gray-900 transition shadow-md"
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

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import img35x5 from "../assets/3.5x5-prev.webp";
import img4x6 from "../assets/4x6-prev.jpg";
import img5x7 from "../assets/5x7-prev.jpg";
import img8x10 from "../assets/8x10-prev.jpg";
import img4x4 from "../assets/4X4-prev.jpg";
import img8x8 from "../assets/8x8-prev.webp";

export default function StandardPhotoPrints() {
  const navigate = useNavigate();

  const [selectedSize, setSelectedSize] = useState("4X6");
  const [selectedPaper, setSelectedPaper] = useState("Luster");

  const sizes = ["3.5X5", "4X6", "5X7", "8X10", "4X4", "8X8"];
  const papers = ["Luster", "Glossy"]; // only these two papers

  const imageMap = {
    "3.5X5": img35x5,
    "4X6": img4x6,
    "5X7": img5x7,
    "8X10": img8x10,
    "4X4": img4x4,
    "8X8": img8x8,
  };

  const previewImage = imageMap[selectedSize];

  const getPricePerImage = () => {
    let price = 5;
    if (selectedSize === "3.5X5") price = 3;
    if (selectedSize === "4X6") price = 5;
    if (selectedSize === "5X7") price = 7;
    if (selectedSize === "8X10") price = 10;
    if (selectedSize === "4X4") price = 4;
    if (selectedSize === "8X8") price = 12;

    if (selectedPaper === "Glossy") price += 2;

    return price;
  };

  const handleCreateNow = () => {
    navigate("/image/upload", {
      state: {
        size: selectedSize,
        paperType: selectedPaper,
      },
    });
  };

  return (
    <div className="bg-white px-4 sm:px-8 lg:px-16 py-10 max-w-[1400px] mx-auto">
      <p className="text-xs tracking-widest text-gray-500 mb-6 sm:mb-8 uppercase">
        HOME &gt; STANDARD SIZE PHOTO PRINTS
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        
        {/* LEFT IMAGE */}
        <div className="bg-gray-100 rounded-sm overflow-hidden h-[350px] sm:h-[450px] lg:h-[550px] flex items-center justify-center">
          <img
            src={previewImage}
            alt="preview"
            className="w-full h-full object-contain transition-all duration-300"
          />
        </div>

        {/* RIGHT PANEL */}
        <div>
          <h1 className="text-[32px] sm:text-[40px] lg:text-[48px] font-serif leading-tight mb-4">
            Standard Size Photo Prints
          </h1>

          <div className="flex items-center gap-2 sm:gap-3 mb-6">
            <div className="flex text-[#b99a6d] text-xl sm:text-2xl">★★★★★</div>
            <span className="text-gray-500 text-xs sm:text-sm">1084 reviews</span>
          </div>

          <p className="text-lg mb-6">
            <span className="font-semibold">Price:</span> AED {getPricePerImage()}
          </p>

          {/* Print Size */}
          <div className="mb-10">
            <p className="font-semibold mb-3">
              Print Size: <span className="font-normal">{selectedSize} in</span>
            </p>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`relative border px-4 py-2 text-sm rounded-sm transition cursor-pointer ${
                    selectedSize === size
                      ? "border-black font-semibold"
                      : "border-gray-300 hover:border-gray-500"
                  }`}
                >
                  {size === "5X7" && (
                    <span className="absolute -top-2 left-2 bg-[#b99a6d] text-white text-[10px] px-2 py-[2px] rounded">
                      MOST POPULAR
                    </span>
                  )}
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Paper Type */}
          <div className="mb-10">
            <p className="font-semibold mb-3">
              Paper: <span className="font-normal underline">{selectedPaper}</span>
            </p>

            <div className="flex flex-wrap gap-3">
              {papers.map((paper) => (
                <button
                  key={paper}
                  onClick={() => setSelectedPaper(paper)}
                  className={`border px-5 py-2 text-sm rounded-sm transition cursor-pointer ${
                    selectedPaper === paper
                      ? "border-black font-semibold"
                      : "border-gray-300 hover:border-gray-500"
                  }`}
                >
                  {paper}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleCreateNow}
            className="w-full bg-black text-white py-4 tracking-widest text-sm font-semibold mt-4 cursor-pointer"
          >
            CREATE NOW
          </button>
        </div>
      </div>
    </div>
  );
}

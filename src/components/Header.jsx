import { useNavigate } from "react-router";
import logo from "../assets/logo.png"
import React from "react";
import { FaHome } from "react-icons/fa";

function Header() {
  const navigate = useNavigate()
  return (
    <>
      <div className="header flex items-center justify-between px-10 py-4 border-b">
        {/* LEFT - SEARCH */}
        <div className="search flex-1 flex justify-start">
          <div className="flex items-center bg-white border border-gray-300 rounded-sm h-11 px-4 shadow-sm focus-within:border-black transition w-full max-w-xs">
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400 tracking-wide"
            />
            <svg
              className="w-5 h-5 text-gray-500 ml-3 cursor-pointer hover:text-black transition"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>

        {/* CENTER - LOGO */}
        <div className="logo flex-1 flex justify-center">
          <img src={logo} alt="" />
          {/* <h1 className="text-[48px] font-serif leading-tight tracking-wide">Inekas</h1> */}
        </div>

        {/* RIGHT - AUTH */}
        <div className="auth flex-1 flex justify-end items-center gap-4">
          {/* Go to Home Button */}
              <button
                onClick={() => navigate("/admin")}
                className="text-sm"
              >
                SignIN
              </button>
          <i className="fa fa-shopping-bag text-black text-lg"></i>
        </div>
      </div>
    </>
  );
}

export default Header;

import React from 'react'
import { useState } from "react";
import Text from "../login/Text.svg";
import logo2 from "../../components/images/LoginNew.png";
import { Link } from "react-router-dom";

const InstructorReg = () => {
  return (
    <div className="w-full h-full flex items-start ">
    {/* Left Part Form and Login */}
    <div className="w-1/2 h-screen flex flex-col p-10 justify-between bg-gray-800">
      <div className="w-full flex flex-col max-w-[550px]:">
        <div className="w-full flex flex-col mb-1">
          <h3 className="text-4xl font-bold mb-4 text-white">Register To LearnHub</h3>
          <p className="text-base mb-2 text-gray-200">Create your account and Join now for free</p>
        </div>

        <div className="w-full flex flex-col">
          <input
            type="text"
            id="username"
            // value={data.username}
            // onChange={handleInputChange}
            placeholder="Name *"
            className="w-full text-black py-2 bg-transparent my-2 border-b border-[#968BC9] outline-none focus:outline-none"
          />
          <input
            type="email"
            id="email"
            // value={data.email}
            // onChange={handleInputChange}
            placeholder="Email Address *"
            className="w-full text-black py-2 bg-transparent my-2 border-b border-[#968BC9] outline-none focus:outline-none"
          />
          <input
            type="password"
            id="password"
            // value={data.password}
            // onChange={handleInputChange}
            placeholder="Password *"
            className="w-full text-black py-2 bg-transparent my-2 border-b border-[#968BC9] outline-none focus:outline-none"
          />
          <input
            type="password"
            id="confirmPassword"
            placeholder="Re Enter Password *"
            className="w-full text-black py-2 bg-transparent my-2 border-b border-[#968BC9] outline-none focus:outline-none"
            // onChange={(e) => setData({ ...data, confirmPassword: e.target.value })}
          />
          <input
            type="file"
            id="CV file"
            placeholder="Upload CV"
            className="w-full text-white py-2 bg-transparent my-2 border-b border-[#968BC9] outline-none focus:outline-none"
            // onChange={(e) => setData({ ...data, confirmPassword: e.target.value })}
          />
        </div>
        <div className="w-full flex flex-col my-4">
          <button className="w-full bg-blue-600 rounded-md  p-4 text-center text-white flex items-center justify-center" >
            Create Account
          </button>
      
        </div>
       


       

      
      </div>
    </div>

    {/* Right Part Logo and Button */}
    <div className="w-1/2 h-screen flex flex-col p-10 justify-between  bg-gray-800">
      <img src={Text} alt="" className="mb-3" />
      <img src={logo2} alt="" className="w-97"/>
      <Link to="/login">
      <button className="w-full bg-blue-700 rounded-md  p-4 text-center font-semibold text-white flex items-center justify-center">
          Login to Existing Account
          </button>
    </Link>
    </div>
  </div>
  )
}

export default InstructorReg
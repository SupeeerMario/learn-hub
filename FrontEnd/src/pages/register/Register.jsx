import React, { useState } from "react";
import Text from "../login/Text.svg";
import logo2 from "../../components/images/LoginNew.png";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [data, setData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleInputChange = (e) => {
    const newData = { ...data };
    newData[e.target.id] = e.target.value;
    setData(newData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Data before sending:", data);
    
    if (!data.email.includes("@") || !data.email.includes(".")) {
      alert("Please enter a valid email address.");
      return;
    }

    if (data.password.length < 8) {
      alert("Password must be at least 8 characters long.");
      return;
    }

    if (data.password !== data.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      const userRegistrationData = {
        username: data.username,
        email: data.email,
        password: data.password,
      };

      const response = await fetch("http://localhost:8002/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userRegistrationData),
      });
      console.log("Response status:", response.status);
      console.log("Response body:", await response.json());

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      alert("Registration successful!");
      navigate("/Login");

    } catch (error) {
      console.error("Error registering user:", error);
    }
  };
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
              value={data.username}
              onChange={handleInputChange}
              placeholder="Name *"
              className="w-full text-white py-2 bg-transparent my-2 border-b border-[#968BC9] outline-none focus:outline-none"
            />
            <input
              type="email"
              id="email"
              value={data.email}
              onChange={handleInputChange}
              placeholder="Email Address *"
              className="w-full text-white py-2 bg-transparent my-2 border-b border-[#968BC9] outline-none focus:outline-none"
            />
            <input
              type="password"
              id="password"
              value={data.password}
              onChange={handleInputChange}
              placeholder="Password *"
              className="w-full text-white py-2 bg-transparent my-2 border-b border-[#968BC9] outline-none focus:outline-none"
            />
            <input
              type="password"
              id="confirmPassword"
              placeholder="Re Enter Password *"
              className="w-full text-white py-2 bg-transparent my-2 border-b border-[#968BC9] outline-none focus:outline-none"
              onChange={(e) => setData({ ...data, confirmPassword: e.target.value })}
            />
          </div>
          <div className="w-full flex flex-col my-4">
            <button className="w-full bg-blue-600 rounded-md  p-4 text-center text-white flex items-center justify-center" onClick={handleSubmit}>
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
  );

};

export default Register;
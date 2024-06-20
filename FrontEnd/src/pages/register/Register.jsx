import React, { useState } from "react";
import Text from "../login/Text.svg";
import logo2 from "../../components/images/LoginNew.png";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [data, setData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
    cvFile: null,
  });

  const handleInputChange = (e) => {
    const newData = { ...data };
    newData[e.target.id] = e.target.value;
    setData(newData);
  };

  const handleRoleChange = (e) => {
    setData({ ...data, role: e.target.value });
  };

  const handleFileChange = (e) => {
    setData({ ...data, cvFile: e.target.files[0] });
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
      const formData = new FormData();
      formData.append('username', data.username);
      formData.append('email', data.email);
      formData.append('password', data.password);
      formData.append('role', data.role);
      if (data.role === 'instructor' && data.cvFile) {
        formData.append('cvFile', data.cvFile);
      }
      console.log("FormData entries:");
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }

      const response = await fetch("http://localhost:8002/auth/register", {
        method: "POST",
        body: formData,
      });

      console.log("Response status:", response.status);
      const responseBody = await response.json();
      console.log("Response body:", responseBody);

      if (!response.ok) {
        throw new Error(`Error: ${responseBody.message || response.statusText}`);
      }

      alert("Registration successful!");
      navigate("/login");

    } catch (error) {
      console.error("Error registering user:", error);
      alert(`Registration failed: ${error.message}`);
    }
  };

  return (
    <div className="w-full h-full flex items-start">
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
              value={data.confirmPassword}
              onChange={handleInputChange}
              placeholder="Re-enter Password *"
              className="w-full text-white py-2 bg-transparent my-2 border-b border-[#968BC9] outline-none focus:outline-none"
            />
            {data.role === "instructor" && (
              <input
                type="file"
                id="cvFile"
                onChange={handleFileChange}
                placeholder="Upload CV"
                className="w-full text-white py-2 bg-transparent my-2 border-b border-[#968BC9] outline-none focus:outline-none"
              />
            )}
          </div>
          <div className="w-full flex flex-col my-4">
            <div className="flex mb-4">
              <label className="flex items-center mr-4">
                <input
                  type="radio"
                  id="student"
                  name="role"
                  value="student"
                  checked={data.role === "student"}
                  onChange={handleRoleChange}
                  className="mr-2"
                />
                <span className="text-white">Student</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  id="instructor"
                  name="role"
                  value="instructor"
                  checked={data.role === "instructor"}
                  onChange={handleRoleChange}
                  className="mr-2"
                />
                <span className="text-white">Instructor</span>
              </label>
            </div>
            <button
              className="w-full bg-blue-600 rounded-md p-4 text-center text-white flex items-center justify-center"
              onClick={handleSubmit}
            >
              Create Account
            </button>
          </div>
        </div>
      </div>

      {/* Right Part Logo and Button */}
      <div className="w-1/2 h-screen flex flex-col p-10 justify-between bg-gray-800">
        <img src={Text} alt="" className="mb-3" />
        <img src={logo2} alt="" className="w-97" />
        <Link to="/login">
          <button className="w-full bg-blue-700 rounded-md p-4 text-center font-semibold text-white flex items-center justify-center">
            Login to Existing Account
          </button>
        </Link>
      </div>
    </div>
  );
}

export default Register;

// Login.js
import jwt_decode from "jwt-decode";
import React, { useState } from "react";
import Text from "../login/Text.svg";
import logo2 from "../../components/images/LoginNew.png";
import { Link } from "react-router-dom";
import { GoogleLogin } from '@react-oauth/google';
import "./loginStyle.css";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

const Login = () => {
  const [data, setData] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (e) => {
    const newData = { ...data };
    newData[e.target.id] = e.target.value;
    setData(newData);
  };
  const navigate = useNavigate();
  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log("Data before sending:", data);
  
    if (!data.email.includes("@") || !data.email.includes(".")) {
      alert("Please enter a valid email address.");
      return;
    }
  
    if (!data.email || !data.password) {
      alert("Please enter both email and password");
      return;
    }
    try {
      const response = await fetch("http://localhost:8002/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: 'include' // Ensure cookies are included
      });
  
      if (!response.ok) {
        throw new Error("Login failed: " + (await response.text()));
      }
  
      const loginData = await response.json(); 
  
      if (loginData) {
        const decodedToken = jwt_decode(loginData.token);
  
        const currentUser = {
          _id: decodedToken.mongoUserID,
          username: decodedToken.mongoUserName,
          email: decodedToken.email,
          profilepic: decodedToken.userProfilePic,
        };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
  
        console.log('currentUser set in local storage:', currentUser);
        
        document.cookie = `token=${loginData.token}; SameSite=Strict; Secure; path=/;`;
  
        console.log("Login successful:", loginData);
        navigate("/home");
      }
  
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  //flex-col lg:flex-row items-center
  return (
    <div className="w-full h-full flex items-start ">
      {/* Left Part Form and Login */}
      <div className="w-1/2 h-screen flex flex-col p-20  justify-between bg-gray-800">
        {/* <div className="w-full flex flex-col max-w-[550px]:"> */}
        {/* <div className="w-full flex flex-col mb-1">
            <h3 className="text-4xl font-bold mb-4">Login</h3>
            <p className="text-base mb-2">
              Welcome To LearnHub, Start your Journey Now
            </p>
          </div> */}

        {/* Form Register or Login
          <div className="w-full flex flex-col">
            <input
              type="email"
              id="email"
              onChange={handleInputChange}
              placeholder="Email Address *"
              className="w-full text-black py-2 bg-transparent my-2 border-b border-[#968BC9] outline-none focus:outline-none"
            />
            <input
              type="Password"
              id="password"
              onChange={handleInputChange}
              placeholder="Password *"
              className="w-full text-black py-2 bg-transparent my-2 border-b border-[#968BC9] outline-none focus:outline-none"
            />
          </div>
          <div className="w-full flex flex-col my-4">
            
            <button onClick={handleSubmit} className="w-full bg-[#968BC9] rounded-md  p-4 text-center text-white flex items-center justify-center">
              Login
            </button>
            </Link>
          </div>

          <div className="w-full flex items-center justify-center relative py-2">
            <div className="w-full h-[0.5px] bg-gray-400"></div>
            <p className="absolute bg-[#FAFAFA] text-gray-400 p-2">or</p>
          </div>

          <div class="mt-7 flex flex-row gap-6 my-1 ">

            <GoogleLogin className="w-10"
              onSuccess={credentialResponse => {
                const credentialResponseDecoded = jwt_decode(credentialResponse.credential)
                console.log(credentialResponseDecoded);
              }}
              onError={() => {
                console.log('Login Failed');
              }}
            />

            <Link to="/register">
              <button className=" bg-[#c1c1c1] rounded-md  p-2 w-60 text-center text-white flex items-center justify-center">
                Create new Account
              </button>
            </Link>
          </div> */}
        {/* </div> */}


        <div class="w-full bg-white rounded-lg  md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              Sign in to your account
            </h1>

            <h1 className="text-sm font-semibold tracking-tight text-gray-900 md:text-2xl dark:text-white">
              Welcome To LearnHub, Start your Journey Now
            </h1>
            {/* ========================Form of Credntails========================  */}
            <form class="space-y-4 md:space-y-6" action="#">
              <div>
                <label for="email" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your email</label>
              {/* =======Email Input============================ */}
                <input type="email" onChange={handleInputChange} name="email" id="email" class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="name@LearnHub.com" required="" />
              </div>
              <div>
                <label for="password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
               {/* =======Password Input============================ */}
                <input type="password" onChange={handleInputChange} name="password" id="password" placeholder="••••••••" class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required="" />
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-start">
                  <div class="flex items-center h-5">
                    <input id="remember" aria-describedby="remember" type="checkbox" class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800" required="" />
                  </div>
                  <div class="ml-3 text-sm">
                    <label for="remember" class="text-gray-500 dark:text-gray-300">Remember me</label>
                  </div>
                </div>
                {/* ==================Forget Password ================= */}
                <a href="#" class="text-sm font-medium text-primary-600 hover:underline dark:text-primary-500">Forgot password?</a>
              </div>
              <button type="submit" onClick={handleSubmit} class="w-full  text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">Sign in</button>
              <Link to="/register">
              <p class="text-sm font-light text-gray-500 dark:text-gray-400">

                Don’t have an account yet? <a href="#" class="font-medium text-primary-600 hover:underline dark:text-primary-500">Sign up</a>
              </p>
              </Link>
            </form>
          </div>
        </div>
      </div>








      {/* Right Part Logo and Button */}
      <div className="w-1/2 h-screen flex flex-col p-10 justify-between bg-gray-800">
        <img src={Text} alt="" className="mb-3 " />
        <img src={logo2} alt="" className="w-97" />
        <Link to="/register">
          <button className="w-full bg-primary-600 rounded-md  p-4 text-center font-semibold text-white flex items-center justify-center">
            Join Now For Free
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Login;

//

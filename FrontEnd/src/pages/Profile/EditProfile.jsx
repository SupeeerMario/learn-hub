import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/StickyComponent/Side Bar/Sidebar';
import Cookies from 'js-cookie';

const EditProfile = () => {
  const [username, setUsername] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [bio, setBio] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const handleUsernameChange = (e) => setUsername(e.target.value);
  const handleProfileImageChange = (e) => setProfileImage(e.target.files[0]);
  const handleBioChange = (e) => setBio(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = Cookies.get('token');

    if (!token) {
      setError('User not authenticated. Please log in.');
      return;
    }

    const formData = new FormData();
    if (username) {
      formData.append('username', username);
    }
    if (bio) {
      formData.append('bio', bio);
    }
    if (profileImage) {
      formData.append('profileImage', profileImage);
    }

    try {
      const response = await fetch('http://localhost:8002/auth/editUser', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      console.log('Profile updated successfully', result);
      setSuccess('Profile updated successfully');

      // Fetch updated profile data
      const updatedProfileResponse = await fetch('http://localhost:8002/auth/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!updatedProfileResponse.ok) {
        throw new Error('Failed to fetch updated profile');
      }

      const updatedProfile = await updatedProfileResponse.json();
      console.log('Updated Profile:', updatedProfile);

      // Navigate to the profile page after a short delay
      setTimeout(() => {
        navigate('/Login');
      }, 1000);
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
      setError('There was a problem updating the profile. Please try again.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Sidebar />
      <div className="ml-64 bg-gray-900 mt-16 px-8 flex-1">
        <section>
          <div className="max-w-2xl px-4 py-8 mx-auto lg:py-16">
            <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Update Profile</h2>
            {error && <p className="text-red-600">{error}</p>}
            {success && <p className="text-green-600">{success}</p>}
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 mb-4 sm:grid-cols-2 sm:gap-6 sm:mb-5">
                <div className="sm:col-span-2">
                  <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">User Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    id="name" 
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" 
                    value={username} 
                    onChange={handleUsernameChange} 
                    placeholder="/LearnHubUser" 
                  />
                </div>
                <div className="w-full">
                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" htmlFor="file_input">Upload Profile Image</label>
                  <input 
                    className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" 
                    aria-describedby="file_input_help" 
                    id="file_input" 
                    type="file" 
                    onChange={handleProfileImageChange} 
                  />
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-300" id="file_input_help">SVG, PNG or JPG (MAX. 2000x2000px).</p>
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Bio</label>
                  <textarea 
                    id="description" 
                    rows="8" 
                    className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" 
                    value={bio} 
                    onChange={handleBioChange} 
                    placeholder="Write a Unique Bio here..."
                  ></textarea>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button 
                  type="submit" 
                  className="text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                >
                  Update Profile
                </button>
                <button 
                  type="button" 
                  className="text-red-600 inline-flex items-center hover:text-white border border-red-600 hover:bg-red-600 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:border-red-500 dark:text-red-500 dark:hover:text-white dark:hover:bg-red-600 dark:focus:ring-red-900"
                >
                  <svg className="w-5 h-5 mr-1 -ml-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                  Delete Account
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
  
};

export default EditProfile;

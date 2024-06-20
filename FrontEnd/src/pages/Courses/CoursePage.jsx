import React, { useEffect } from 'react';
import Sidebar from '../../components/StickyComponent/Side Bar/Sidebar';
import profilepic from "../../components/images/profile.jpg";
import { Link } from 'react-router-dom';
import axios from 'axios';

const CourseDetails = () => {
  const authorizeZoom = () => {
    const clientId = process.env.REACT_APP_ZOOM_CLIENT_ID;
    const redirectUri = process.env.REACT_APP_ZOOM_REDIRECT_URL;
    console.log('Authorizing Zoom with clientId:', clientId, 'and redirectUri:', redirectUri);
    window.location.href = `https://zoom.us/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}`;
  };

  const createMeeting = async (e) => {
    e.preventDefault(); // Prevent the default action
    console.log('Button clicked: Creating meeting...');
    try {
      const response = await axios.post('http://localhost:8004/create-meeting', {}, { withCredentials: true });
      console.log('Meeting created. Join URL:', response.data.join_url);
      alert(`Meeting created. Join URL: ${response.data.join_url}`);
    } catch (error) {
      console.error('Error creating meeting:', error);
      alert('Error creating meeting. Please try again.');
    }
  };

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get('code')) {
      // Handle OAuth callback and exchange code for access token
      const fetchAccessToken = async () => {
        const code = query.get('code');
        try {
          const response = await axios.get(`http://localhost:8004/callback?code=${code}`, { withCredentials: true });
          console.log('Access token obtained:', response.data);
        } catch (error) {
          console.error('Error fetching access token:', error);
        }
      };
      fetchAccessToken();
    }
  }, []);

  return (
    <div>
      <Sidebar />
      <div className="bg-gray-800 min-h-screen ml-64 pt-24 text-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 ml-4 mr-4">
          <div className="space-y-6">
            <h1 className="text-4xl font-bold">Introduction to Web Development</h1>
            <button
              type="button"
              className="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none rounded-lg border border-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
              onClick={authorizeZoom}
            >
              Authorize Zoom
            </button>
            <button
              type="button"
              className="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none rounded-lg border border-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
              onClick={createMeeting}
            >
              Create Meeting with Instructor
            </button>
            <div className="space-y-4">
              <p className="text-gray-400">
                Learn the fundamentals of web development, including HTML, CSS, and JavaScript. This course is designed
                for beginners and covers the essential skills needed to build modern web applications.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-medium">Duration</h3>
                  <p className="text-gray-400">12 hours</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium">Level</h3>
                  <p className="text-gray-400">Beginner</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium">Instructor</h3>
                  <p className="text-gray-400">John Doe</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium">Language</h3>
                  <p className="text-gray-400">English</p>
                </div>
              </div>
            </div>
            <div className='py-2'>
              <Link to="/CoursePage">
                <button type="button" className="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none rounded-lg border border-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">
                  Lecture 1
                </button>
              </Link>
              <Link to="/CoursePage">
                <button type="button" className="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none rounded-lg border border-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">
                  Lecture 2
                </button>
              </Link>
              <Link to="/CoursePage">
                <button type="button" className="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none rounded-lg border border-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">
                  Lecture 3
                </button>
              </Link>
              <Link to="/CoursePage">
                <button type="button" className="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none rounded-lg border border-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">
                  Lecture 4
                </button>
              </Link>
            </div>
          </div>
          <div className="space-y-6 px-8">
            <div className="aspect-video rounded-lg overflow-hidden">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/zpdOGUIw9dA"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen>
              </iframe>
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Video Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-medium">Duration</h3>
                  <p className="text-gray-400">45 minutes</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium">Publisher</h3>
                  <p className="text-gray-400">Acme Inc.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 ml-4 mr-4 p-4">
          <h2 className="text-2xl font-bold mb-4">Student Feedback</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
              <div className="p-4">
                <div className="flex items-center space-x-4">
                  <img src={profilepic} alt="Avatar" width={48} height={48} className="rounded-full" />
                  <div>
                    <h3 className="text-lg font-medium">Jane Doe</h3>
                    <p className="text-gray-400">5 out of 5 stars</p>
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-gray-700">
                <p className="text-gray-400">
                  This course was amazing! The instructor was very knowledgeable and the content was well-structured. I
                  highly recommend it to anyone interested in web development.
                </p>
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
              <div className="p-4">
                <div className="flex items-center space-x-4">
                  <img src={profilepic} alt="Avatar" width={48} height={48} className="rounded-full" />
                  <div>
                    <h3 className="text-lg font-medium">Ahmed Magdy</h3>
                    <p className="text-gray-400">4 out of 5 stars</p>
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-gray-700">
                <p className="text-gray-400">
                  The course was very informative and the instructor did a great job explaining the concepts. I learned a
                  lot and feel more confident in my web development skills.
                </p>
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
              <div className="p-4">
                <div className="flex items-center space-x-4">
                  <img src={profilepic} alt="Avatar" width={48} height={48} className="rounded-full" />
                  <div>
                    <h3 className="text-lg font-medium">Khaled Shabaan</h3>
                    <p className="text-gray-400">4.5 out of 5 stars</p>
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-gray-700">
                <p className="text-gray-400">
                  I really enjoyed this course. The content was well-organized and the instructor was very engaging. I
                  would definitely recommend it to anyone looking to learn web development.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;

import React from 'react';
import { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/login/login';
import Register from './pages/register/Register';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Landing from './components/landingPage/landing';
import INSTDashboard from './pages/Dashboard/INSTDashboard';
import STUDashboard from './pages/Dashboard/STUDashboard';
import Community from './pages/Communities/Community';
import CreateCommunity from './pages/Communities/CreateCommunity';
import Package from './pages/packagePage/package';
import Profile from './pages/Profile/Profile';
import EditProfile from './pages/Profile/EditProfile';
import Chat from './pages/Chat/Chat';
import AI from './pages/AskAi/AI';
import Courses from './pages/Courses/Courses';
import MyCourses from './pages/Courses/MyCourses';
import CreateCourse from './pages/Courses/CreateCourse';
import CommunityPage from './pages/Communities/CommunityPage';
import NewCommunity from './pages/Communities/NewCommunity';
import CourseDetails from './pages/Courses/CourseDetails';
import Todos  from './pages/ToDoList/Todo';
import ContactUs from './pages/ContactUS/ContactUs';
import CoursePage from './pages/Courses/CoursePage';
import InstructorReg from './pages/register/InstructorReg';



function App() {
  const [communityData, setCommunityData] = useState([
    { id: 1, name: 'Community 1', details: 'Details for Community 1' },
    { id: 2, name: 'Community 2', details: 'Details for Community 2' },
    { id: 3, name: 'Community 3', details: 'Details for Community 3' },
    { id: 4, name: 'Community 4', details: 'Details for Community 4' },
    { id: 5, name: 'Community 5', details: 'Details for Community 5' },
  ]);

  const handleSaveCommunity = (newCommunity) => {
    setCommunityData([...communityData, { id: communityData.length + 1, ...newCommunity }]);
    // Optionally, you can navigate back to the community page after saving
  };
  return (

    // <Community></Community>

    //<Dashboard/> 
    <Router>
      <Routes>
        {/* ===========Commuinty Routes================= */}
        <Route exact path="/Community" element={<Community communityData={communityData} />} />
        <Route exact path="/CreateCommunity" element={<CreateCommunity onSave={handleSaveCommunity} />} />
        <Route exact path="/CommunityPage/:communityId" element={<CommunityPage />} />
        <Route exact path="/NewCommunity" element={<NewCommunity />} />

        {/* ===========Login & Register Routes================= */}
        <Route exact path="/login" element={<Login />} />
        <Route exact path="/register" element={<Register />} />
        <Route exact path="/InstructorReg" element={<InstructorReg />} />
        {/* ===========Chat Routes================= */}
        <Route exact path="/Inbox" element={<Chat />} />

        {/* ===========Profile Routes================= */}
        <Route exact path="/EditProfile" element={<EditProfile />} />
        <Route exact path="/Profile" element={<Profile />} />

        {/* ===========Courses Routes================= */}
        <Route exact path="/Courses" element={<Courses />} />
        <Route exact path="/CourseDetails/:courseId" element={<CourseDetails />} />
        <Route exact path="/CoursePage" element={<CoursePage />} />
        <Route exact path="/MyCourses" element={<MyCourses />} />
        <Route exact path="/CreateCourse" element={<CreateCourse />} />

        <Route exact path="/Packages" element={<Package />} />
        <Route exact path="/INSTDashboard" element={<INSTDashboard />} />
        <Route exact path="/STUDashboard" element={<STUDashboard />} />
        <Route exact path="/Home" element={<Landing />} />
        <Route exact path="/AI" element={<AI />} />
        <Route exact path="/ToDoList" element={<Todos  />} />
        <Route exact path="/ContactUs" element={<ContactUs />} />





      </Routes>
    </Router>
  );
}

export default App;

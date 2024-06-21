import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/StickyComponent/Side Bar/Sidebar';
import { ResponsiveLine } from '@nivo/line';
import { ResponsiveBar } from '@nivo/bar';

// Helper function to get cookie value
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
};

const Dashboard = () => {
  const [topEnrolledCourses, setTopEnrolledCourses] = useState([]);
  const [topRatedCourses, setTopRatedCourses] = useState([]);
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = getCookie('token');

        const response = await fetch('http://localhost:8002/auth/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log('Fetched user profile:', data);
        setUserName(data.username); // Assuming the response has a username field
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    const fetchCourses = async () => {
      try {
        const token = getCookie('token');

        const response = await fetch('http://localhost:8003/course/getallforuser', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log('Fetched courses:', data);

        // Process the fetched data
        const processedCourses = data.map(course => ({
          id: course._id,
          title: course.name,
          enrolled: course.members.length,
          rating: course.feedbacks ? course.feedbacks.reduce((acc, feedback) => acc + feedback.rating, 0) / course.feedbacks.length : 0
        }));

        // Sort by enrolled and rating
        const sortedByEnrolled = [...processedCourses].sort((a, b) => b.enrolled - a.enrolled);
        const sortedByRating = [...processedCourses].sort((a, b) => b.rating - a.rating);

        setTopEnrolledCourses(sortedByEnrolled.slice(0, 3));
        setTopRatedCourses(sortedByRating.slice(0, 3));
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    fetchUserProfile();
    fetchCourses();
  }, []);

  const handleViewCourse = (courseId) => {
    navigate(`/CourseDetails/${courseId}`);
  };

  return (
    <div>
      <Sidebar />
      <div className="bg-gray-800 min-h-screen ml-64 pt-24 text-white">
        <div className="flex flex-col min-h-screen bg-gray-800 text-white">
          <header className="bg-gray-700 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-sm text-gray-400">Welcome, {userName}</p>
              </div>
            </div>
          </header>
          <main className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            {/* Student Enrollment */}
            <div className="bg-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-medium">Student Enrollment</h2>
              <div className="h-64">
                <ResponsiveLine
                  data={[
                    {
                      id: 'students',
                      data: [
                        { x: 'Jan', y: 50 },
                        { x: 'Feb', y: 200 },
                        { x: 'Mar', y: 150 },
                        { x: 'Apr', y: 300 },
                        { x: 'May', y: 100 },
                        { x: 'Jun', y: 50 },
                      ],
                    },
                  ]}
                  margin={{ top: 50, right: 50, bottom: 50, left: 50 }}
                  xScale={{ type: 'point' }}
                  yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: true, reverse: false }}
                  axisTop={null}
                  axisRight={null}
                  axisBottom={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: 'Month',
                    legendOffset: 36,
                    legendPosition: 'middle',
                  }}
                  axisLeft={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: 'Students',
                    legendOffset: -40,
                    legendPosition: 'middle',
                  }}
                  pointSize={10}
                  pointColor={{ theme: 'background' }}
                  pointBorderWidth={2}
                  pointBorderColor={{ from: 'serieColor' }}
                  pointLabelYOffset={-12}
                  useMesh={true}
                />
              </div>
            </div>
            {/* Course Completion */}
            <div className="bg-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-medium">Course Completion</h2>
              <div className="h-64">
                <ResponsiveBar
                  data={[
                    { month: 'Jan', count: 111 },
                    { month: 'Feb', count: 157 },
                    { month: 'Mar', count: 129 },
                    { month: 'Apr', count: 150 },
                    { month: 'May', count: 119 },
                    { month: 'Jun', count: 72 },
                  ]}
                  keys={['count']}
                  indexBy="month"
                  margin={{ top: 50, right: 50, bottom: 50, left: 50 }}
                  padding={0.3}
                  valueScale={{ type: 'linear' }}
                  indexScale={{ type: 'band', round: true }}
                  colors={{ scheme: 'nivo' }}
                  borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                  axisTop={null}
                  axisRight={null}
                  axisBottom={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: 'Month',
                    legendPosition: 'middle',
                    legendOffset: 32,
                  }}
                  axisLeft={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: 'Completion',
                    legendPosition: 'middle',
                    legendOffset: -40,
                  }}
                  labelSkipWidth={12}
                  labelSkipHeight={12}
                  labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                  legends={[]}
                  role="application"
                  ariaLabel="Nivo bar chart demo"
                  barAriaLabel={function (e) { return e.id + ": " + e.formattedValue + " in month: " + e.indexValue; }}
                />
              </div>
            </div>
            {/* Top Enrolled Courses */}
            <div className="bg-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-medium">Top Enrolled Courses</h2>
              <div className="space-y-4">
                {topEnrolledCourses.map((course, index) => (
                  <div key={index} className="bg-gray-600 rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">{course.title}</h3>
                      <p className="text-sm text-gray-400">{course.enrolled} students enrolled</p>
                    </div>
                    <button className="text-blue-500 hover:text-blue-700" onClick={() => handleViewCourse(course.id)}>View</button>
                  </div>
                ))}
              </div>
            </div>
            {/* Top Rated Courses */}
            <div className="bg-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-medium">Top Rated Courses</h2>
              <div className="space-y-4">
                {topRatedCourses.map((course, index) => (
                  <div key={index} className="bg-gray-600 rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">{course.title}</h3>
                      <p className="text-sm text-gray-400">{course.rating} AVG Rate</p>
                    </div>
                    <button className="text-blue-500 hover:text-blue-700" onClick={() => handleViewCourse(course.id)}>View</button>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

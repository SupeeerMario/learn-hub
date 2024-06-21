import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/StickyComponent/Side Bar/Sidebar';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveBar } from '@nivo/bar';

import Cookies from 'js-cookie';

// Helper function to get cookie value
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

const generateExplanation = (completedRate) => {
  let explanation, advice;
  
  if (completedRate >= 90) {
    explanation = "Excellent work! You've nearly completed all your courses.";
    advice = "Keep up the great effort and continue striving for excellence.";
  } else if (completedRate >= 75) {
    explanation = "Great job! You're on track to complete your courses.";
    advice = "Try to dedicate a little more time to finish the remaining lectures.";
  } else if (completedRate >= 50) {
    explanation = "You're halfway there! There's still some work to do.";
    advice = "Consider setting a study schedule to complete your courses on time.";
  } else if (completedRate >= 25) {
    explanation = "You've made some progress, but there's a lot more to cover.";
    advice = "Focus on understanding the core concepts and regularly review your materials.";
  } else {
    explanation = "You have a lot of courses left to complete.";
    advice = "Start by breaking down your study sessions into manageable chunks.";
  }

  return { explanation, advice };
};

const Dashboard = () => {
  const [ongoingCourses, setOngoingCourses] = useState([]);
  const [finishedCourses, setFinishedCourses] = useState([]);
  const [userName, setUserName] = useState('');
  const [completionRate, setCompletionRate] = useState({ completed: 0, notCompleted: 0 });
  const [explanation, setExplanation] = useState('');
  const [advice, setAdvice] = useState('');
  const [productivityData, setProductivityData] = useState([]);
  const [productiveDay, setProductiveDay] = useState('');
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

        const response = await fetch('http://localhost:8003/course/getCourseuser', {
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

        // Separate courses into ongoing and finished
        const ongoing = data.filter(course => !course.completed);
        const finished = data.filter(course => course.completed);

        setOngoingCourses(ongoing);
        setFinishedCourses(finished);

        // Calculate the completion rate
        calculateCompletionRate(finished);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    fetchUserProfile();
    fetchCourses();
    generateProductivityData();
  }, []);

  const handleViewCourse = (courseId) => {
    navigate(`/CourseDetails/${courseId}`);
  };

  const getOpenedLectures = (courseId) => {
    const cookieName = `course_${courseId}_lectures`;
    let openedLectures = getCookie(cookieName);

    if (openedLectures) {
      try {
        // Removing the surrounding [ and ] from the string
        openedLectures = openedLectures.replace(/^\[|\]$/g, '');
        // Splitting the string by comma to get the array elements
        openedLectures = openedLectures.split(',').map(item => item.trim());
        if (!Array.isArray(openedLectures)) {
          openedLectures = [];
        }
      } catch (e) {
        console.error('Error parsing cookie value:', e);
        openedLectures = [];
      }
    } else {
      openedLectures = [];
    }

    return openedLectures.length;
  };

  const calculateCompletionRate = (finishedCourses) => {
    if (finishedCourses.length === 0) {
      setExplanation("Start your journey by first joining some courses.");
      setAdvice("Explore available courses and enroll in ones that interest you.");
      return;
    }

    let totalLectures = 0;
    let openedLectures = 0;

    finishedCourses.forEach(course => {
      const courseOpenedLectures = getOpenedLectures(course._id);
      openedLectures += courseOpenedLectures;
      totalLectures += course.materials.length;
    });

    const completedRate = (openedLectures / totalLectures) * 100;
    setCompletionRate({
      completed: Math.round(completedRate),
      notCompleted: Math.round(100 - completedRate)
    });

    const { explanation, advice } = generateExplanation(completedRate);
    setExplanation(explanation);
    setAdvice(advice);
  };

  const generateProductivityData = () => {
    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const productivity = daysOfWeek.map(day => ({
      day,
      lectures: Math.floor(Math.random() * 10)
    }));

    setProductivityData(productivity);

    const mostProductive = productivity.reduce((max, day) => day.lectures > max.lectures ? day : max, productivity[0]);
    setProductiveDay(mostProductive.day);
  };

  return (
    <div>
      <Sidebar />
      <div className="bg-gray-800 min-h-screen ml-64 pt-24 text-white">
        <div className="flex flex-col min-h-screen bg-gray-800 text-white">
          <header className="bg-gray-700 px-6 py-4 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-sm text-gray-400">Welcome, {userName}</p>
              </div>
            </div>
          </header>
          <main className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            {/* Ongoing Courses */}
            <div className="bg-gray-700 rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-medium mb-4">Ongoing Courses</h2>
              <ul className="space-y-4">
                {ongoingCourses.map((course) => (
                  <li
                    key={course._id}
                    className="flex justify-between text-white cursor-pointer"
                    onClick={() => handleViewCourse(course._id)}
                  >
                    <span>{course.name}</span>
                    <span>{getOpenedLectures(course._id)} / {course.materials.length} lectures opened</span>
                  </li>
                ))}
              </ul>
            </div>
            {/* Finished Courses */}
            <div className="bg-gray-700 rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-medium mb-4">Finished Courses</h2>
              <ul className="space-y-4">
                {finishedCourses.map((course) => (
                  <li
                    key={course._id}
                    className="flex justify-between text-white cursor-pointer"
                    onClick={() => handleViewCourse(course._id)}
                  >
                    <span>{course.name}</span>
                    <span>{getOpenedLectures(course._id)} / {course.materials.length} lectures opened</span>
                  </li>
                ))}
              </ul>
            </div>
            {/* Completion Rate */}
            <div className="bg-gray-700 rounded-lg p-6 shadow-lg flex col-span-2 items-center">
              <div className="w-1/3 pr-4 text-center">
                <h2 className="text-xl font-medium mb-4">Completion Rate</h2>
                <p className="text-lg">{explanation}</p>
                <p className="text-md mt-2">{advice}</p>
              </div>
              {finishedCourses.length > 0 && (
                <div className="w-2/3 h-64">
                  <ResponsivePie
                    data={[
                      { id: 'Completed', label: 'Completed', value: completionRate.completed, color: 'hsl(122, 70%, 50%)' },
                      { id: 'Not Completed', label: 'Not Completed', value: completionRate.notCompleted, color: 'hsl(0, 0%, 80%)' }
                    ]}
                    margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                    innerRadius={0.5}
                    padAngle={0.7}
                    cornerRadius={3}
                    colors={{ datum: 'data.color' }}
                    borderWidth={1}
                    borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                    radialLabelsSkipAngle={10}
                    radialLabelsTextXOffset={6}
                    radialLabelsTextColor="#ffffff"
                    radialLabelsLinkOffset={0}
                    radialLabelsLinkDiagonalLength={16}
                    radialLabelsLinkHorizontalLength={24}
                    radialLabelsLinkStrokeWidth={1}
                    radialLabelsLinkColor={{ from: 'color' }}
                    slicesLabelsSkipAngle={10}
                    slicesLabelsTextColor="#ffffff"
                    animate={true}
                    motionStiffness={90}
                    motionDamping={15}
                    theme={{
                      labels: {
                        text: {
                          fontSize: 14,
                          fontWeight: 'bold',
                        },
                      },
                    }}
                  />
                </div>
              )}
            </div>
            {/* Productivity */}
            <div className="bg-gray-700 rounded-lg p-6 shadow-lg flex col-span-2 items-center">
              <div className="w-1/3 pr-4 text-center">
                <h2 className="text-xl font-medium mb-4">Productivity</h2>
                <p className="text-lg">You're most productive on {productiveDay}.</p>
                <p className="text-md mt-2">Keep up the good work and try to maintain consistency.</p>
              </div>
              <div className="w-2/3 h-64">
                <ResponsiveBar
                  data={productivityData}
                  keys={['lectures']}
                  indexBy="day"
                  margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                  padding={0.3}
                  colors={{ scheme: 'nivo' }}
                  borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                  axisTop={null}
                  axisRight={null}
                  axisBottom={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: 'Day',
                    legendPosition: 'middle',
                    legendOffset: 32
                  }}
                  axisLeft={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: 'Lectures',
                    legendPosition: 'middle',
                    legendOffset: -40
                  }}
                  labelSkipWidth={12}
                  labelSkipHeight={12}
                  labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                  animate={true}
                  motionStiffness={90}
                  motionDamping={15}
                  theme={{
                    labels: {
                      text: {
                        fontSize: 14,
                        fontWeight: 'bold',
                      },
                    },
                  }}
                />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

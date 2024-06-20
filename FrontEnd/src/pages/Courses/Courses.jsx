import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/StickyComponent/Side Bar/Sidebar';
import LogoUdacity from "../../components/images/LogoUdacity.png";
import { useNavigate } from 'react-router-dom';

const Courses = () => {
    const [courses, setCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [filter, setFilter] = useState('All');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                console.log('Fetching courses...');
                const response = await fetch('http://localhost:8003/course/random6Courses', {
                    method: 'GET',
                    credentials: 'include'
                });
                console.log('Response status:', response.status);
                const data = await response.json();
                console.log('Fetched courses:', data);
                setCourses(data);
                setFilteredCourses(data); // Initialize filtered courses with all courses
            } catch (error) {
                console.error('Error fetching courses:', error);
            }
        };

        fetchCourses();
    }, []);

    const handleFilterChange = (status) => {
        setFilter(status);
        console.log('Filter status:', status);
        if (status === 'All') {
            setFilteredCourses(courses);
        } else {
            const isCompleted = status === 'Completed';
            const filtered = courses.filter(course => course.completed === isCompleted);
            console.log('Filtered courses:', filtered);
            setFilteredCourses(filtered);
        }
    };

    const handleOpenCourse = (courseId) => {
        console.log('Navigating to CourseDetails with courseId:', courseId);
        navigate(`/CourseDetails/${courseId}`);
    };

    return (
        <div>
            <Sidebar />
            <div className="bg-gray-800 min-h-screen ml-64 pt-16">
                <div className="py-4 px-2 sm:px-4 lg:px-2">
                    <div className="text-left p-8 mb-3">
                        <div className="flex justify-between items-center">
                            <h1 className="text-4xl font-bold text-white">Courses</h1>
                            <div className="flex space-x-2 mt-3">
                                <button
                                    className={`bg-transparent hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded ${filter === 'All' ? 'bg-gray-700' : ''}`}
                                    onClick={() => handleFilterChange('All')}
                                >
                                    All
                                </button>
                                <button
                                    className={`bg-transparent hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded ${filter === 'Ongoing' ? 'bg-gray-700' : ''}`}
                                    onClick={() => handleFilterChange('Ongoing')}
                                >
                                    Ongoing
                                </button>
                                <button
                                    className={`bg-transparent hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded ${filter === 'Completed' ? 'bg-gray-700' : ''}`}
                                    onClick={() => handleFilterChange('Completed')}
                                >
                                    Completed
                                </button>
                            </div>
                        </div>
                        <p className='text-gray-400'>Welcome to <strong>learnHub Courses</strong> page where you can find many mentors <br />
                            to have knowledge from them. With our expertise in many fields you <br />
                            take your course and hop straight into the work field directly and <br />
                            gain the knowledge you need.</p>
                    </div>
                    <hr className="h-px my-4 bg-gray-200 border-0 dark:bg-gray-700" />

                    {/*===================== Button Div =================*/}
                    <div className="flex justify-between items-center mb-6 px-8">
                        <div className="flex space-x-4">
                            <button className="bg-transparent hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded">
                                Classes
                            </button>
                            <button className="bg-transparent hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded">
                                Calendar
                            </button>
                        </div>
                    </div>
                    {/*====================== Div Courses=============== */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-8 ">
                        {filteredCourses.map((course) => (
                            <div key={course._id} className="bg-gray-700 text-white rounded-lg overflow-hidden">
                                <div className="flex items-center space-x-4 p-4">
                                    <div className="bg-white rounded-full w-12 flex items-center justify-center">
                                        <img src={LogoUdacity} alt="Instructor" className="w-full h-full object-center" />
                                    </div>
                                    <div className="flex-grow">
                                        <div className="flex justify-between items-center">
                                            <div className="font-semibold">{course.name}</div>
                                            <div className={`text-xs font-semibold py-1 px-3 rounded-full ${course.completed ? 'bg-green-600' : 'bg-yellow-500'} text-white`}>
                                                {course.completed ? 'Completed' : 'Ongoing'}
                                            </div>
                                        </div>
                                        <div className="text-sm opacity-70 p-2">{course.about}</div>
                                        <button
                                            type="button"
                                            onClick={() => handleOpenCourse(course._id)}
                                            className="py-2.5 px-14 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none rounded-lg border border-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                                        >
                                            Open Course
                                        </button>
                                    </div>
                                </div>

                                {/* =============Part to Edit progress=================== */}
                                <div className="p-4 border-t border-gray-600">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm opacity-70">Level: {course.level}</span>
                                        <span className="text-sm opacity-70">Language: {course.language}</span>
                                    </div>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="bg-gray-600 text-white px-2 py-1 rounded-full text-xs">8/10</span>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5 text-green-500"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </div>
                                    <div className="mt-2">
                                        <div className="w-full h-2 bg-gray-600 rounded-full">
                                            <div className="h-full bg-green-500 rounded-full" style={{ width: "80%" }} />
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center mt-4 text-sm">
                                        <span>Due: Dec 19</span>
                                        <span>HC/MC</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Courses;

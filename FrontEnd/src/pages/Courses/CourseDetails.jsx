import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../../components/StickyComponent/Side Bar/Sidebar';
import profilepic from "../../components/images/profile.jpg";
import Cookies from 'js-cookie';

const CourseDetails = () => {
    const { courseId } = useParams();
    const [courseDetails, setCourseDetails] = useState(null);
    const [ownerDetails, setOwnerDetails] = useState(null);
    const [status, setStatus] = useState('Ongoing'); // Default to "Ongoing"
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [showCompletionBar, setShowCompletionBar] = useState(false);
    const [isUploadPopupOpen, setIsUploadPopupOpen] = useState(false);
    const [userRole, setUserRole] = useState('');
    const [data, setData] = useState({
        materials: [],
    });

    useEffect(() => {
        const fetchCourseDetails = async () => {
            try {
                const response = await fetch(`http://localhost:8003/course/get/${courseId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include'
                });
                const data = await response.json();
                setCourseDetails(data.course);
                setStatus(data.course.completed ? 'Completed' : 'Ongoing'); // Set initial status based on course completion status
                setShowCompletionBar(data.course.completed); // Set showCompletionBar based on fetched completed status
                setData((prevData) => ({
                    ...prevData,
                    materials: data.course.materials.map((material, index) => ({
                        file: null,
                        lecture: `Lecture ${index + 1}`,
                        fileUrl: material.file,
                        title: material.title,
                    }))
                }));

                const responseOwner = await fetch(`http://localhost:8002/auth/profile`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include'
                });
                const ownerData = await responseOwner.json();
                setOwnerDetails(ownerData);

                const role = Cookies.get('userRole');
                setUserRole(role);
            } catch (error) {
                console.error('Error fetching course details:', error);
            }
        };

        fetchCourseDetails();
    }, [courseId]);

    const handleStatusChange = async () => {
        try {
            const response = await fetch(`http://localhost:8003/course/complete/${courseId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ completed: status === 'Completed' })
            });

            if (!response.ok) {
                throw new Error('Failed to update course status');
            }

            const updatedCourse = await response.json();
            setCourseDetails(updatedCourse.course);
            setShowCompletionBar(updatedCourse.course.completed); // Show completion bar if the course is marked as completed
            setIsPopupOpen(false); // Close popup after submit
        } catch (error) {
            console.error('Error updating course status:', error);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const newFile = { file, lecture: `Lecture ${data.materials.length + 1}` };
            setData((prevData) => ({
                ...prevData,
                materials: [...prevData.materials, newFile],
            }));
        }
    };

    const handleFileDelete = (index) => {
        const newMaterials = data.materials.filter((_, i) => i !== index);
        setData((prevData) => ({
            ...prevData,
            materials: newMaterials.map((material, i) => ({ ...material, lecture: `Lecture ${i + 1}` })),
        }));
    };

    const moveLectureUp = (index) => {
        if (index === 0) return;
        const newMaterials = [...data.materials];
        [newMaterials[index], newMaterials[index - 1]] = [newMaterials[index - 1], newMaterials[index]];
        setData((prevData) => ({
            ...prevData,
            materials: newMaterials.map((material, i) => ({ ...material, lecture: `Lecture ${i + 1}` })),
        }));
    };

    const moveLectureDown = (index) => {
        if (index === data.materials.length - 1) return;
        const newMaterials = [...data.materials];
        [newMaterials[index], newMaterials[index + 1]] = [newMaterials[index + 1], newMaterials[index]];
        setData((prevData) => ({
            ...prevData,
            materials: newMaterials.map((material, i) => ({ ...material, lecture: `Lecture ${i + 1}` })),
        }));
    };

    const handleFileUpload = async (e) => {
        e.preventDefault();
        if (data.materials.length === 0) {
            alert("Please upload course materials.");
            return;
        }

        const token = Cookies.get('token');
        const formData = new FormData();

        data.materials.forEach((material, index) => {
            if (material.file) {
                formData.append('files', material.file); // Ensure files are all under the 'files' key
                formData.append('lectures', material.lecture); // Ensure lectures are all under the 'lectures' key
            }
        });

        try {
            const response = await fetch(`http://localhost:8003/course/upload/${courseId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to upload files');
            }

            const updatedCourse = await response.json();
            setCourseDetails(updatedCourse.course);
            setIsUploadPopupOpen(false); // Close popup after submit
        } catch (error) {
            console.error('Error uploading files:', error);
        }
    };

    const handleLectureOpen = (index) => {
        let openedLectures = Cookies.get(`course_${courseId}_lectures`);
        if (openedLectures) {
            try {
                openedLectures = JSON.parse(decodeURIComponent(openedLectures));
                if (!Array.isArray(openedLectures)) {
                    openedLectures = [];
                }
            } catch (e) {
                openedLectures = [];
            }
        } else {
            openedLectures = [];
        }
    
        if (!openedLectures.includes(index)) {
            openedLectures.push(index);
            Cookies.set(`course_${courseId}_lectures`, JSON.stringify(openedLectures), { expires: 7 });
            console.log(`Opened lectures: ${openedLectures.length}`);
        }
    };

    if (!courseDetails || !ownerDetails) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <Sidebar />
            <div className="bg-gray-800 min-h-screen ml-64 pt-24 text-white">
                {showCompletionBar && (
                    <div className="bg-green-600 text-white text-center mb-2">
                        This course is marked as completed
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 ml-4 mr-4">
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h1 className="text-4xl font-bold">{courseDetails.name}</h1>
                            {userRole === 'instructor' && (
                                <button
                                    type="button"
                                    className="py-2.5 px-5 mb-2 text-sm font-medium text-gray-900 focus:outline-none rounded-lg border border-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                                    onClick={() => setIsPopupOpen(true)}
                                >
                                    Course Status
                                </button>
                            )}
                        </div>
                        <div className="space-y-4">
                            <p className="text-gray-400">{courseDetails.about}</p>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h3 className="text-lg font-medium">Duration</h3>
                                    <p className="text-gray-400">12 hours</p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium">Level</h3>
                                    <p className="text-gray-400">{courseDetails.level}</p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium">Instructor</h3>
                                    <p className="text-gray-400">{ownerDetails.username}</p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium">Language</h3>
                                    <p className="text-gray-400">{courseDetails.language}</p>
                                </div>
                            </div>
                        </div>
                        <div className="py-2 flex flex-col space-y-2">
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                                {courseDetails.materials.map((material, index) => (
                                    <a
                                        key={index}
                                        href={material.file}
                                        className="py-2.5 px-5 text-sm font-medium text-gray-900 focus:outline-none rounded-lg border border-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 text-center"
                                        onClick={() => handleLectureOpen(index)}
                                    >
                                        Lecture {index + 1}
                                    </a>
                                ))}
                            </div>
                            {userRole === 'instructor' && (
                                <button
                                    type="button"
                                    className="py-2.5 px-5 mb-2 text-sm font-medium text-gray-900 focus:outline-none rounded-lg border border-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                                    onClick={() => setIsUploadPopupOpen(true)}
                                >
                                    Upload Material
                                </button>
                            )}
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
                                allowFullScreen
                            />
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
                                    <p className="text-gray-400">{ownerDetails.username}</p>
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
                                    This course was amazing! The instructor was very knowledgeable and the content was well-structured. I highly recommend it to anyone interested in web development.
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
                                    The course was very informative and the instructor did a great job explaining the concepts. I learned a lot and feel more confident in my web development skills.
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
                                    I really enjoyed this course. The content was well-organized and the instructor was very engaging. I would definitely recommend it to anyone looking to learn web development.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isPopupOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-gray-800 p-6 rounded-lg">
                        <h2 className="text-xl font-bold mb-4 text-white">Change Course Status</h2>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full p-2 mb-4 rounded bg-gray-700 text-white"
                        >
                            <option value="Ongoing">Ongoing</option>
                            <option value="Completed">Completed</option>
                        </select>
                        <button
                            onClick={handleStatusChange}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded mr-2"
                        >
                            Submit
                        </button>
                        <button
                            onClick={() => setIsPopupOpen(false)}
                            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {isUploadPopupOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-gray-800 p-6 rounded-lg w-96">
                        <h2 className="text-xl font-bold mb-4 text-white">Upload Material</h2>
                        <input
                            type="file"
                            onChange={handleFileChange}
                            className="w-full p-2 mb-4 rounded bg-gray-700 text-white"
                        />
                        {data.materials.length > 0 && (
                            <div className="mt-4">
                                <h3 className="text-sm font-medium leading-6 text-white">Uploaded Materials</h3>
                                <ul className="mt-2 space-y-2">
                                    {data.materials.map((material, index) => (
                                        <li key={index} className="flex items-center justify-between bg-gray-700 p-2 rounded-md">
                                            <div className="flex items-center">
                                                <span className="mr-2 text-sm text-gray-400">{material.lecture}</span>
                                                <span className="text-sm text-gray-400">{material.file ? material.file.name : material.fileUrl}</span>
                                            </div>
                                            {material.file && (
                                                <div className="flex items-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => moveLectureUp(index)}
                                                        className="text-blue-500 hover:text-blue-700 mr-2"
                                                    >
                                                        ↑
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => moveLectureDown(index)}
                                                        className="text-blue-500 hover:text-blue-700 mr-2"
                                                    >
                                                        ↓
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleFileDelete(index)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <button
                            onClick={handleFileUpload}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded mr-2"
                        >
                            Submit
                        </button>
                        <button
                            onClick={() => setIsUploadPopupOpen(false)}
                            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseDetails;

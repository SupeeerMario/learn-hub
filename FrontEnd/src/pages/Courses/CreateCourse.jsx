import React, { useState } from 'react';
import Sidebar from '../../components/StickyComponent/Side Bar/Sidebar';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const CreateCourse = () => {
    const navigate = useNavigate();

    const [data, setData] = useState({
        name: '',
        description: '',
        level: 'Beginner',  // Default level
        language: 'Arabic',  // Default language
        materials: [],
    });

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setData((prevData) => ({
            ...prevData,
            [id]: value,
        }));
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Data before sending:", data);
    
        if (!data.name) {
            alert("Please enter a course name.");
            return;
        }
    
        if (data.materials.length === 0) {
            alert("Please upload course materials.");
            return;
        }
    
        const token = Cookies.get('token');
        const formData = new FormData();
    
        formData.append('name', data.name);
        formData.append('about', data.description);
        formData.append('level', data.level);
        formData.append('language', data.language);
    
        data.materials.forEach((material, index) => {
            formData.append('files', material.file); // Ensure files are all under the 'files' key
            formData.append('lectures', material.lecture); // Ensure lectures are all under the 'lectures' key
        });
    
        console.log('Form Data:', formData);
    
        try {
            const response = await fetch('http://localhost:8003/course/new', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
                credentials: 'include'
            });
    
            if (!response.ok) {
                throw new Error(`Bad Request`);
            }
            const result = await response.json();

            const createdCourse = result.course; 
            console.log('Created Course:', createdCourse);
            alert("Course Created!");
            navigate(`/CourseDetails/${createdCourse._id}`);
        } catch (error) {
            console.error('Error creating course:', error);
        }
    };
    

    return (
        <div className="flex flex-col bg-gray-800 min-h-screen">
            <Sidebar />
            <form className='ml-64 mt-24 bg-gray-800 text-gray-300 p-3' onSubmit={handleSubmit}>
                <div className="space-y-12">
                    <div className="border-b border-gray-700 pb-12">
                        <h1 className="font-bold leading-9 text-3xl">Create Course</h1>
                        <p className="mt-1 text-sm leading-6">
                            This information will be displayed publicly so be careful what you share.
                        </p>

                        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                            <div className="sm:col-span-4">
                                <label htmlFor="name" className="block text-sm font-medium leading-6">
                                    Course Name
                                </label>
                                <div className="mt-2">
                                    <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-600 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                                        <span className="flex select-none items-center pl-3 text-gray-400 sm:text-sm">LearnHub.com/</span>
                                        <input
                                            type="text"
                                            name="name"
                                            id="name"
                                            value={data.name}
                                            onChange={handleInputChange}
                                            autoComplete="name"
                                            className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-300 placeholder-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                                            placeholder="WebDevelopment1"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="col-span-full">
                                <label htmlFor="description" className="block text-sm font-medium leading-6">
                                    Description
                                </label>
                                <div className="mt-2">
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={data.description}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="w-full rounded-md border-0 py-1.5 text-gray-800 shadow-sm ring-1 ring-inset ring-gray-600 placeholder-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-800 sm:text-sm sm:leading-6"
                                        defaultValue={''}
                                    />
                                </div>
                                <p className="mt-3 text-sm leading-6">Write a few sentences about the course.</p>
                            </div>

                            {/* Add level selection */}
                            <div className="sm:col-span-3">
                                <label htmlFor="level" className="block text-sm font-medium leading-6">
                                    Course Level
                                </label>
                                <div className="mt-2">
                                    <select
                                        id="level"
                                        name="level"
                                        value={data.level}
                                        onChange={handleInputChange}
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-800 shadow-sm ring-1 ring-inset ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-sky-800 sm:max-w-md sm:text-sm sm:leading-6"
                                    >
                                        <option>Beginner</option>
                                        <option>Intermediate</option>
                                        <option>Professional</option>
                                    </select>
                                </div>
                            </div>

                            {/* Add language selection */}
                            <div className="sm:col-span-3">
                                <label htmlFor="language" className="block text-sm font-medium leading-6">
                                    Language
                                </label>
                                <div className="mt-2">
                                    <select
                                        id="language"
                                        name="language"
                                        value={data.language}
                                        onChange={handleInputChange}
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-800 shadow-sm ring-1 ring-inset ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-sky-800 sm:max-w-md sm:text-sm sm:leading-6"
                                    >
                                        <option>Arabic</option>
                                        <option>English</option>
                                    </select>
                                </div>
                            </div>

                            <div className="col-span-full">
                                <label htmlFor="materials" className="block text-sm font-medium leading-6">
                                    Course Materials
                                </label>
                                <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-600/25 px-6 py-10">
                                    <div className="text-center">
                                        <div className="mt-4 flex text-sm leading-6">
                                            <label
                                                htmlFor="file-upload"
                                                className="relative cursor-pointer rounded-md bg-gray-700 font-semibold text-indigo-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                                            >
                                                <span>Upload course materials</span>
                                                <input 
                                                    id="file-upload" 
                                                    name="file-upload" 
                                                    type="file" 
                                                    className="sr-only" 
                                                    onChange={handleFileChange} 
                                                />
                                            </label>
                                            <p className="pl-1">or drag and drop</p>
                                        </div>
                                        <p className="text-xs leading-5">PDF, DOCX, PPT up to 10MB</p>
                                    </div>
                                </div>
                            </div>

                            <div className="col-span-full">
                                {data.materials.length > 0 && (
                                    <div className="mt-4">
                                        <h3 className="text-sm font-medium leading-6">Uploaded Materials</h3>
                                        <ul className="mt-2 space-y-2">
                                            {data.materials.map((material, index) => (
                                                <li key={index} className="flex items-center justify-between bg-gray-700 p-2 rounded-md">
                                                    <div className="flex items-center">
                                                        <span className="mr-2 text-sm text-gray-400">{material.lecture}</span>
                                                        <span className="text-sm text-gray-400">{material.file.name}</span>
                                                    </div>
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
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-x-6">
                    <button type="button" className="text-sm font-semibold leading-6">
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                        Save
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateCourse;

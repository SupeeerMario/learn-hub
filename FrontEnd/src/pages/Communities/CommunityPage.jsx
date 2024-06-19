import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/StickyComponent/Side Bar/Sidebar';
import { useParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import nopic from "../../components/images/404.jpeg";

const CommunityPage = () => {
    const [activeTab, setActiveTab] = useState('Posts');
    const [community, setCommunity] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [members, setMembers] = useState([]);
    const [userFriends, setUserFriends] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const { communityId } = useParams();
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [posts, setPosts] = useState([]);
    const [files, setFiles] = useState([]);
    const [showFileModal, setShowFileModal] = useState(false);

    useEffect(() => {
        const fetchCommunityData = async () => {
            try {
              console.log(`commmmmid ${communityId}`);
              const token = Cookies.get('token');
      
              const response = await fetch(`http://localhost:8003/community/get/${communityId}`, {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${token}`
                },
                credentials: 'include'
              });
              
      
              if (!response.ok) {
                throw new Error("Retrieving data failed: " + (await response.text()));
              }
      
              const data = await response.json();
              setCommunity(data);
              setUserRole(data.userRole);
              setCurrentUser(data.userId);
              console.log("Fetched Community:", data);
               
              if (data.community.members && data.community.members.length > 0) {
                console.log("Members array exists and is not empty:", data.community.members);
                setMembers(data.community.members);

              } else {
                console.log("No members found.");
                setMembers([]);
              }
            } catch (error) {
              console.error("Fetch community data error:", error);
              setError(error.message);
            }
          };
          const fetchFriendList = async () => {
            try {
              const token = Cookies.get('token');
      
              const response = await fetch('http://localhost:8002/auth/getFriendList', {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${token}`
                },
                credentials: 'include'
              });
      
              if (!response.ok) {
                throw new Error("Retrieving friend list failed: " + (await response.text()));
              }
      
              const friends = await response.json();
              setUserFriends(friends);
              console.log("Fetched Friends:", friends);
            } catch (error) {
              console.error("Fetch friend list error:", error);
              setError(error.message);
            }
          };

          const fetchPosts = async () => {
            try {
                const response = await fetch(`http://localhost:8003/community/getAllPostsforcommunity/${communityId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch posts');
                }
                const postsData = await response.json();
                setPosts(postsData);
            } catch (error) {
                console.error('Error fetching posts:', error);
                setError(error.message);
            }
        };

        const fetchFiles = async () => {
            try {
              const token = Cookies.get('token');
              const response = await fetch(`http://localhost:8003/community/getFilesFromCommunity/${communityId}`, {
                method: 'GET',
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                credentials: 'include'
              });
      
              if (!response.ok) {
                throw new Error('Failed to fetch files');
              }
      
              const filesData = await response.json();
              setFiles(filesData);
            } catch (error) {
              console.error('Error fetching files:', error);
            }
          };

      
          fetchCommunityData();
          fetchFriendList();
          fetchPosts();
          fetchFiles();
        }, [communityId]);

        
        const addFriend = async (friendID) => {
            try {
                if (currentUser && currentUser._id === friendID) {
                    setError('You cannot add yourself as a friend.');
                    return;
                  }
              const token = Cookies.get('token');
        
              const response = await fetch('http://localhost:8002/auth/addFriend    ', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ friendID }),
                credentials: 'include'
              });
        
              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message);
              }
        
              const data = await response.json();
              console.log('Friend added:', data.message);
              setUserFriends(prevFriends => [...prevFriends, { _id: friendID }]);

            } catch (error) {
              console.error('Error adding friend:', error.message);
              setError(error.message);
            }
          };

        if (error) {
            return <div>Error: {error}</div>;
          }
        
          if (!community) {
            return <div>Loading community details...</div>;
          }
      

    const handleCreatePost = () => {
        setShowModal(true);
    };
    const handleAddFile = () => {
        setShowFileModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setShowFileModal(false);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
    
        const formData = new FormData(event.target);
        const formDataObject = {};
        formData.forEach((value, key) => {
            formDataObject[key] = value;
        });
    
        try {
            const token = Cookies.get('token');
    
            // Fetch user profile data including profile picture and username
            const profileResponse  = await fetch('http://localhost:8002/auth/profile', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                credentials: 'include'
            });
            console.log(profileResponse.data)
    
            if (!profileResponse.ok) {
                throw new Error('Failed to fetch user profile');
            }
    
            const userProfileData = await profileResponse.json();
            const userProfilePic = userProfileData.profilepic;
            const username = userProfileData.username;
    
            // Include userProfilePic and username in formDataObject
            formDataObject.imageUrl = userProfilePic || nopic;;
            formDataObject.username = username;
    
    
            const postData = {
                ...formDataObject,
                userProfilePic: userProfilePic,
                username: username // Assuming this is how the username is named in your data structure
            };
    
            const postResponse = await fetch(`http://localhost:8003/community/createpost/${communityId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(postData),
            });
    
            if (!postResponse.ok) {
                throw new Error('Error creating post');
            }
    
            const newPost = await postResponse.json();
            console.log('New Post:', newPost);
            setPosts([...posts, newPost]);
            setShowModal(false);

        } catch (error) {
            console.error('Error creating post:', error);
        }
        
    };

    const handleSubmitFile = async (event) => {
        event.preventDefault();

        const fileInput = event.target.file_input.files[0];
        const title = event.target.title.value;
        const description = event.target.description.value;
        const category = event.target.category.value;

        if (!fileInput || !title) {
            setError('File and title are required.');
            return;
        }

        const formData = new FormData();
        formData.append('file', fileInput);
        formData.append('title', title);
        formData.append('description', description);
        formData.append('category', category);

        try {
            const token = Cookies.get('token');

            const response = await fetch(`http://localhost:8003/community/uploadFile/${communityId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
                credentials: 'include'

            });
            console.log("communityId",communityId)
            if (!response.ok) {
                throw new Error('Failed to upload file');
            }

            const data = await response.json();
            setFiles([...files, data]);
            setShowFileModal(false);

        } catch (error) {
            setError(error.message);
        }
    };
    

    const renderContent = () => {
        switch (activeTab) {
            case 'Posts':
                return (
                    // Content Div Posts Urgent and ETC
<div className="grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 border-t border-gray-200 pt-10 dark:border-gray-700 sm:mt-16 sm:pt-16 lg:mx-0 lg:max-w-none lg:grid-cols-3">
  {posts.map((post) => (
    <article key={post._id} className="flex flex-col items-start justify-between">
      <div className="flex items-center gap-x-4 text-xs">
        <time dateTime={post.createdAt} className="text-gray-500 dark:text-gray-400">
          {new Date(post.createdAt).toLocaleDateString()}
        </time>
        <a
          href={post.category ? `/${post.category.toLowerCase()}` : '#'}
          className="relative z-10 rounded-full bg-gray-50 px-3 py-1.5 font-medium text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          {post.category || 'Uncategorized'}
        </a>
      </div>
      <div className="group relative mt-3">
        <h3 className="text-lg font-semibold leading-6 text-gray-900 group-hover:text-gray-600 dark:text-gray-100 dark:group-hover:text-gray-300">
          <a href={`/posts/${post._id}`} className="hover:underline">
            {post.title}
          </a>
        </h3>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-600 dark:text-gray-400">{post.description}</p>
      </div>
      <div className="relative mt-4 flex items-center gap-x-4">
        <img
          src={post.imageUrl || '/path/to/default/image'}
          alt=""
          className="h-10 w-10 rounded-full bg-gray-50 dark:bg-gray-800"
        />
        <div className="text-sm leading-6">
          <p className="font-semibold text-gray-900 dark:text-gray-100">{post.username}</p>
        </div>
      </div>
    </article>
  ))}
</div>

                );
            case 'Files':
                return <div className="text-white border-t border-gray-200">
                    <section>
                        <div class="mx-auto max-w-screen-xl px-4 lg:px-12">

                            <div class="bg-white dark:bg-gray-800 relative shadow-md sm:rounded-lg overflow-hidden max-w-fill">
                                <div class="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">
                                    <div class="w-full md:w-1/2">
                                        <form class="flex items-center">
                                            <label for="simple-search" class="sr-only">Search</label>
                                            <div class="relative w-full">
                                                <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                    <svg aria-hidden="true" class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                        <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                    <div class="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0">
                                        <button type="button"
                                            data-modal-target="File-modal" data-modal-toggle="crud-modal"
                                            onClick={handleAddFile}
                                            class="flex items-center justify-center text-white bg-primary-700 hover:bg-primary-800 focus:ring-4  focus:ring-primary-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-primary-600 dark:hover:bg-primary-700 focus:outline-none dark:focus:ring-primary-800">
                                            <svg class="-ml-1 mr-1.5 w-5 h-5 transform scale-y-[-1]" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                                <path clip-rule="evenodd" fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                                            </svg>
                                            Add File

                                        </button>
                                        <div class="flex items-center space-x-3 w-full md:w-auto">
                                            <button id="actionsDropdownButton" data-dropdown-toggle="actionsDropdown" class="w-full md:w-auto flex items-center justify-center py-2 px-4 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700" type="button">
                                                <svg class="-ml-1 mr-1.5 w-5 h-5" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                                    <path clip-rule="evenodd" fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                                                </svg>
                                                Actions
                                            </button>
                                            <div id="actionsDropdown" class="hidden z-10 w-44 bg-white rounded divide-y divide-gray-100 shadow dark:bg-gray-700 dark:divide-gray-600">
                                                <ul class="py-1 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="actionsDropdownButton">
                                                    <li>
                                                        <a href="#" class="block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Mass Edit</a>
                                                    </li>
                                                </ul>
                                                <div class="py-1">
                                                    <a href="#" class="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">Delete all</a>
                                                </div>
                                            </div>
                                            <button id="filterDropdownButton" data-dropdown-toggle="filterDropdown" class="w-full md:w-auto flex items-center justify-center py-2 px-4 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700" type="button">
                                                <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="h-4 w-4 mr-2 text-gray-400" viewbox="0 0 20 20" fill="currentColor">
                                                    <path fill-rule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clip-rule="evenodd" />
                                                </svg>
                                                Filter
                                                <svg class="-mr-1 ml-1.5 w-5 h-5" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                                    <path clip-rule="evenodd" fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                                                </svg>
                                            </button>
                                            <div id="filterDropdown" class="z-10 hidden w-48 p-3 bg-white rounded-lg shadow dark:bg-gray-700">
                                                <h6 class="mb-3 text-sm font-medium text-gray-900 dark:text-white">Choose brand</h6>
                                                <ul class="space-y-2 text-sm" aria-labelledby="filterDropdownButton">
                                                    <li class="flex items-center">
                                                        <label for="apple" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100">Apple (56)</label>
                                                    </li>
                                                    <li class="flex items-center">
                                                        <label for="fitbit" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100">Microsoft (16)</label>
                                                    </li>
                                                    <li class="flex items-center">
                                                        <label for="razor" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100">Razor (49)</label>
                                                    </li>
                                                    <li class="flex items-center">
                                                        <label for="nikon" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100">Nikon (12)</label>
                                                    </li>
                                                    <li class="flex items-center">
                                                        <label for="benq" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100">BenQ (74)</label>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="overflow-x-auto">
                                    <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                        <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                            <tr>
                                                <th scope="col" class="px-4 py-3">Name</th>
                                                <th scope="col" class="px-4 py-3">Category</th>

                                                <th scope="col" class="px-4 py-3">Description</th>
                                                <th scope="col" class="px-4 py-3">
                                                    <span class="sr-only">Actions</span>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                        {files.map((file) => (

                                            <tr key={file.id} class="border-b dark:border-gray-700">
                                            <th scope="row" className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                                <a href={file.link} target="_blank" rel="noopener noreferrer">{file.title}</a>
                                            </th>
                                            <td className="px-4 py-3">{file.category}</td>
                                            <td className="px-4 py-3">{file.description}</td>
                                                <td class="px-4 py-3 flex items-center justify-end">
                                                    <button id={`${file.id}-dropdown-button`} data-dropdown-toggle={`${file.id}-dropdown`} class="inline-flex items-center p-0.5 text-sm font-medium text-center text-gray-500 hover:text-gray-800 rounded-lg focus:outline-none dark:text-gray-400 dark:hover:text-gray-100" type="button">
                                                        <svg class="w-5 h-5" aria-hidden="true" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                                                        </svg>
                                                    </button>
                                                    <div id={`${file.id}-dropdown`} class="hidden z-10 w-44 bg-white rounded divide-y divide-gray-100 shadow dark:bg-gray-700 dark:divide-gray-600">
                                                        <ul class="py-1 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="apple-iphone-14-dropdown-button">
                                                            <li>
                                                                <a href="#" class="block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Show</a>
                                                            </li>
                                                            <li>
                                                                <a href="#" class="block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Edit</a>
                                                            </li>
                                                        </ul>
                                                        <div class="py-1">
                                                            <a href="#" class="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">Delete</a>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                    ))}


                                        </tbody>
                                    </table>
                                </div>
                                <nav class="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0 p-4" aria-label="Table navigation">
                                    <span class="text-sm font-normal text-gray-500 dark:text-gray-400">
                                        Showing
                                        <span class="font-semibold text-gray-900 dark:text-white">1-10</span>
                                        of
                                        <span class="font-semibold text-gray-900 dark:text-white">1000</span>
                                    </span>
                                    <ul class="inline-flex items-stretch -space-x-px">
                                        <li>
                                            <a href="#" class="flex items-center justify-center h-full py-1.5 px-3 ml-0 text-gray-500 bg-white rounded-l-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
                                                <span class="sr-only">Previous</span>
                                                <svg class="w-5 h-5" aria-hidden="true" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                    <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                                                </svg>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="#" class="flex items-center justify-center text-sm py-2 px-3 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">1</a>
                                        </li>
                                        <li>
                                            <a href="#" class="flex items-center justify-center text-sm py-2 px-3 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">2</a>
                                        </li>
                                        <li>
                                            <a href="#" aria-current="page" class="flex items-center justify-center text-sm z-10 py-2 px-3 leading-tight text-primary-600 bg-primary-50 border border-primary-300 hover:bg-primary-100 hover:text-primary-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white">3</a>
                                        </li>
                                        <li>
                                            <a href="#" class="flex items-center justify-center text-sm py-2 px-3 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">...</a>
                                        </li>
                                        <li>
                                            <a href="#" class="flex items-center justify-center text-sm py-2 px-3 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">100</a>
                                        </li>
                                        <li>
                                            <a href="#" class="flex items-center justify-center h-full py-1.5 px-3 leading-tight text-gray-500 bg-white rounded-r-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
                                                <span class="sr-only">Next</span>
                                                <svg class="w-5 h-5" aria-hidden="true" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10l-3.293-3.293a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                                                </svg>
                                            </a>
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                        </div>
                    </section>
                </div>
            case 'People':
                return <div className="text-white border-t border-gray-200 ">
                    <div className="text-white border-t border-gray-200">
                        <ul role="list" className="divide-y divide-gray-100 dark:divide-gray-700">
                            {members.map((member) => (
                                <li key={member._id} className="flex justify-between gap-x-6 py-5">
                                    <div className="flex min-w-0 gap-x-4">
                                        <img className="h-12 w-12 flex-none rounded-full bg-gray-50 dark:bg-gray-800" src={member.profilepic || nopic} alt="" />
                                        <div className="min-w-0 flex-auto">
                                            <p className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100">{member.username}</p>
                                            <p className="mt-1 truncate text-xs leading-5 text-gray-500 dark:text-gray-400">{member.email}</p>
                                        </div>
                                    </div>
                                    <div className="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
                                        <p className="text-sm leading-6 text-gray-900 dark:text-gray-100">{member.userRole}</p>
                                        {member.lastSeen ? (
                                            <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">
                                                Last seen <time dateTime={member.lastSeenDateTime}>{member.lastSeen}</time>
                                            </p>
                                        ) : (
                                            <div className="mt-1 flex items-center gap-x-1.5">
                                                <div className="flex-none rounded-full bg-emerald-500/20 dark:bg-emerald-400/20 p-1">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                                                </div>
                                                <p className="text-xs leading-5 text-gray-500 dark:text-gray-400">Online</p>
                                            </div>
                                        )}
                                    </div>
                                    {currentUser !== member._id && (
                                        <button
                                            onClick={() => addFriend(member._id)}
                                            className={`ml-4 rounded-md px-8 py-1 text-sm font-semibold text-white shadow-sm ${userFriends.some(friend => friend._id === member._id) ? 'bg-gray-400' : 'bg-blue-300 hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-200 dark:bg-blue-700 dark:hover:bg-blue-600'}`}
                                            disabled={userFriends.some(friend => friend._id === member._id)}
                                        >
                                            {userFriends.some(friend => friend._id === member._id) ? 'Added' : 'Add Friend'}
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            default:
                return null;
        }
    };

    

    return (
        <div className="bg-slate-800 min-h-full">
            <Sidebar />

            <div className="bg-gray-800 ml-64 py-24 sm:py-32">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl lg:mx-0">
                        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl py-5">{community.community.name}</h2>
                        <p className="mt-2 text-lg leading-8 text-gray-400">
                            {community.community.about}
                        </p>
                    </div>

                    {/* Secondary Navbar */}
                    <div className="mt-8">
                        <nav className="flex space-x-4">
                            {['Posts', 'Files', 'People'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-3 py-2 font-medium rounded-md ${activeTab === tab ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-600 hover:text-white'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                            <button data-modal-target="crud-modal" data-modal-toggle="crud-modal"
                                onClick={handleCreatePost}
                                className={"px-3 py-2 font-medium rounded-md text-white bg-blue-600"}> Create Post </button>
                        </nav>
                    </div>

                    {/* Content */}
                    <div className="mt-10">
                        {renderContent()}
                    </div>
                </div>
            </div>



{/*==========Input Modal for posts================== */}

            {showModal && (
                <div id="crud-modal" tabIndex="-1" aria-hidden="true" className="fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full h-full overflow-y-auto overflow-x-hidden bg-gray-900 bg-opacity-50">
                    <div className="relative p-4 w-full max-w-md max-h-full">
                        {/* Modal content */}
                        <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                            {/* Modal header */}
                            <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Create New Post
                                </h3>
                                <button
                                    type="button"
                                    className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                                    onClick={handleCloseModal}
                                >
                                    <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1l6 6m0 0l6 6M7 7l6-6M7 7L1 13" />
                                    </svg>
                                    <span className="sr-only">Close modal</span>
                                </button>
                            </div>
                            {/* Modal body */}
                            <form className="p-4 md:p-5" onSubmit={handleSubmit}>
                                <div className="grid gap-4 mb-4 grid-cols-2">
                                    <div className="col-span-2">
                                        <label htmlFor="title" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Title</label>
                                        <input type="text" id="title" name="title" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Enter Title" required />
                                    </div>
                                    <div className="col-span-2 sm:col-span-1">
                                        <label htmlFor="category" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Category</label>
                                        <select id="category" name="category" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500">
                                            <option value="" disabled>Select category</option>
                                            <option value="Important">Important</option>
                                            <option value="Class Material">Class Material</option>
                                            <option value="Exam">Exam</option>
                                            <option value="Discussion">Discussion</option>
                                        </select>
                                    </div>
                                    <div className="col-span-2">
                                        <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Description</label>
                                        <textarea id="description" name="description" rows="4" className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Enter Description"></textarea>
                                    </div>
                                </div>
                                <button type="submit" className="text-white inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                    <svg className="me-1 -ms-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                                    </svg>
                                    Add Post
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/*==========Input Modal for Files================== */}
            {showFileModal && (
                <div id="File-modal" tabindex="-1" aria-hidden="true" className="fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full h-full overflow-y-auto overflow-x-hidden bg-gray-900 bg-opacity-50">
                    <div className="relative p-4 w-full max-w-md max-h-full">
                        {/* Modal content */}
                        <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                            {/* Modal header */}
                            <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Add New File
                                </h3>
                                <button
                                    type="button"
                                    className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                                    onClick={handleCloseModal}
                                >
                                    <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1l6 6m0 0l6 6M7 7l6-6M7 7L1 13" />
                                    </svg>
                                    <span className="sr-only">Close modal</span>
                                </button>
                            </div>
                            {/* Modal body */}
                            <form className="p-4 md:p-5" onSubmit={handleSubmitFile}>
                                <div className="grid gap-4 mb-4 grid-cols-2">
                                    <div className="col-span-2">
                                        <label htmlFor="title" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Title</label>
                                        <input type="text" name="title" id="title" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Make Unique Title for your post " required />
                                    </div>
                                    <div className="col-span-2 sm:col-span-1">
                                        <label htmlFor="category" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Category</label>
                                        <select id="category" name="category"  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500">
                                            <option value="" selected disabled>Select category</option>
                                            <option value="Important">Important</option>
                                            <option value="Class">Class Matarial</option>
                                            <option value="Exam">Exam</option>
                                            <option value="Discusson">Discussion</option>
                                        </select>
                                    </div>
                                    <div className="col-span-2 sm:col-span-1">
                                        <label htmlFor="file" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Upload</label>
                                        <input name="file"  class="block w-full text-sm p-2 text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" id="file_input" type="file" style={{ height: '40px' }} />
                                    </div>
                                    <div className="col-span-2">
                                        <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">File Description</label>
                                        <textarea name="description" id="description" rows="4" className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Write your Post here"></textarea>
                                    </div>
                                </div>
                                <button type="submit" className="text-white inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                    <svg className="me-1 -ms-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                                    </svg>
                                    Upload File to community
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}




        </div>
    );
};

export default CommunityPage;

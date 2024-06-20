import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/StickyComponent/Side Bar/Sidebar';
import { useNavigate } from 'react-router-dom';
import Footer from '../../components/Footer/Footer';
import Cookies from 'js-cookie';
import { scroller } from 'react-scroll';

const NewCommunity = ({ communityData: initialCommunityData = [] }) => {
    const [communityList, setCommunityList] = useState(initialCommunityData);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredCommunityList, setFilteredCommunityList] = useState(initialCommunityData);
    const [discoverSearchQuery, setDiscoverSearchQuery] = useState('');
    const [filteredDiscoverCommunityList, setFilteredDiscoverCommunityList] = useState(initialCommunityData);
    const [tenCommunities, setTenCommunities] = useState([]);
    const [currentPage, setCurrentPage] = useState(1); // Track the current page for pagination

    let navigate = useNavigate();

    const createPageRoute = () => {
        let path = "/CreateCommunity";
        navigate(path, { replace: true });
    };

    const communityPageRoute = (communityId) => {
        console.log("Navigating to community with ID:", communityId);
        let trimmedId = communityId.trim();
        console.log("Trimmed community ID:", trimmedId);
        let path = `/CommunityPage/${trimmedId}`;
        navigate(path, { replace: true });
    };

    const handleSaveCommunity = (newCommunity) => {
        setCommunityList([...communityList, { id: communityList.length + 1, ...newCommunity }]);
    };

    const fetchCommunities = async () => {
        try {
            const token = Cookies.get('token');
            console.log(`Token: ${token}`);
            const response = await fetch('http://localhost:8003/community/getallforuser', {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` // Ensure token is correctly formatted
                },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`Error fetching communities: ${response.statusText}`);
            }

            const data = await response.json();

            if (!Array.isArray(data.communities)) {
                throw new Error('Invalid community data format');
            }
            return data;
        } catch (error) {
            console.error('Error fetching communities:', error);
            return [];
        }
    };

    const fetchTenCommunities = async (page) => {
        try {
            console.log(`fetchTenCommunities called for page: ${page}`);
            const token = Cookies.get('token');
            console.log(`Token for fetchTenCommunities: ${token}`);
            if (!token) {
                throw new Error('Token not found');
            }
            const response = await fetch(`http://localhost:8003/community/getTenCommunities?page=${page}`, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` 
                },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`Error fetching ten communities: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Fetched ten communities:', data);
            setTenCommunities(data.communities);
            setFilteredDiscoverCommunityList(data.communities);

        } catch (error) {
            console.error('Error fetching ten communities:', error);
        }
    };

    const joinCommunity = async (communityId) => {
        try {
            const token = Cookies.get('token');
            if (!token) {
                throw new Error('Token not found');
            }
            const response = await fetch(`http://localhost:8003/community/joinCommunity/${communityId}`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`Error joining community: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Joined community:', data);

            // Navigate to the community page after successfully joining
            communityPageRoute(communityId);
            console.log("you should be navigatted")
        } catch (error) {
            console.error('Error joining community:', error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const communities = await fetchCommunities();
                setCommunityList(communities.communities);
                setFilteredCommunityList(communities.communities);
                setFilteredDiscoverCommunityList(communities.communities);

                console.log('communities:', communities);
                setIsLoading(false);
            } catch (error) {
                console.error('Error loading communities:', error);
                setIsLoading(false);
            }
        };

        fetchData();
        fetchTenCommunities(currentPage);
    }, [currentPage]);

    useEffect(() => {
        console.log('Updated ten communities:', tenCommunities);
    }, [tenCommunities]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim() === '') {
            setFilteredCommunityList(communityList);
        } else {
            const filtered = communityList.filter(community =>
                community.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredCommunityList(filtered);
        }
    };

    const handleDiscoverSearch = (e) => {
        e.preventDefault();
        if (discoverSearchQuery.trim() === '') {
            setFilteredDiscoverCommunityList(tenCommunities);
        } else {
            const filtered = tenCommunities.filter(community =>
                community.name.toLowerCase().includes(discoverSearchQuery.toLowerCase())
            );
            setFilteredDiscoverCommunityList(filtered);
        }
    };

    const handleSearchQueryChange = (e) => {
        setSearchQuery(e.target.value);
        if (e.target.value.trim() === '') {
            setFilteredCommunityList(communityList);
        }
    };

    const handleDiscoverSearchQueryChange = (e) => {
        setDiscoverSearchQuery(e.target.value);
        if (e.target.value.trim() === '') {
            setFilteredDiscoverCommunityList(tenCommunities);
        }
    };

    const handleRefresh = () => {
        setCurrentPage(prevPage => prevPage + 1);
        fetchTenCommunities(currentPage + 1);
        scroller.scrollTo('DiscoverCommunities', {
            duration: 800,
            delay: 0,
            smooth: 'easeInOutQuart'
        });
    };

    return (
        <div className='flex flex-col bg-gray-800 min-h-screen'>
            <Sidebar />

            {/* ========================== Heading Part =========================== */}
            <div className='ml-64 mt-24 px-8'>
                <h2 className="text-4xl font-extrabold dark:text-white">Communities</h2>
                <p className="my-4 text-lg text-gray-500">Easiest way to manage and connect with other colleagues who have the same interests as you.</p>
                <p className="mb-4 text-lg font-normal text-gray-500 dark:text-gray-400">
                    Join or Create Community and Upload your Materials and Expand your knowledge with people and share your day-to-day achievements with your community & Connect with your mentors and Teachers who share their Exclusive Content inside this community.
                </p>

                <div className='flex flex-row'>
                    <button
                        onClick={createPageRoute}
                        type="button"
                        className="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none rounded-lg border flex flex-row border-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                    >
                        Create Community
                    </button>

                    <form className="flex items-center max-w-sm mx-auto ml-96" onSubmit={handleSearch}>
                        <label htmlFor="simple-search" className="sr-only">Search</label>
                        <div className="relative w-full">
                            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 20">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5v10M3 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm12 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm0 0V6a3 3 0 0 0-3-3H9m1.5-2-2 2 2 2" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                id="simple-search"
                                value={searchQuery}
                                onChange={handleSearchQueryChange}
                                className="border border-gray-300 px-16 text-gray-900 text-sm rounded-lg block w-full ps-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                placeholder="Search Community Name...."
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="p-2.5 ms-2 text-sm font-medium text-white rounded-lg border focus:ring-4 focus:outline-none dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                        >
                            <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                <path stroke="currentColor" d="M19 19l-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                            </svg>
                            <span className="sr-only">Search</span>
                        </button>
                    </form>
                </div>
            </div>
            <hr className="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />

            {/* ========================== Created Part =========================== */}
            <div className='ml-64 px-8' id='YourCommunities'>
                <h2 className="text-3xl font-bold dark:text-white">Your Communities</h2>
                <div className="flex flex-col gap-4 mt-8">
                    {isLoading ? (
                        <p className="text-center">Loading communities...</p>
                    ) : (
                        filteredCommunityList.length > 0 ? (
                            filteredCommunityList.map((community) => (
                                <div className="p-5 bg-gray-50 rounded-lg shadow dark:bg-gray-700 dark:border-gray-200" key={community._id}>
                                    <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                                        <a href="#">{community.name}</a>
                                    </h3>
                                    <span className="text-gray-500 dark:text-gray-400">{}</span>
                                    <p className="mt-3 mb-4 font-light text-gray-500 dark:text-gray-400">{community.about}</p>
                                    <button
                                        onClick={() => communityPageRoute(community._id)}
                                        type="button"
                                        className="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none rounded-lg border border-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                                    >
                                        Open Community
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p className="text-center">No communities found.</p>
                        )
                    )}
                </div>
            </div>
            <hr className="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />

            {/* ========================== Discover Part =========================== */}
            <div className='ml-64 px-8' id='DiscoverCommunities'>
                <div className='flex flex-row'>
                    <h2 className="text-3xl font-bold dark:text-white">Discover Communities</h2>

                    {/* =========Search For Communities */}
                    <form className="flex items-center max-w-sm mx-auto ml-80" onSubmit={handleDiscoverSearch}>
                        <label htmlFor="discover-search" className="sr-only">Search</label>
                        <div className="relative w-full">
                            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 20">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5v10M3 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm12 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm0 0V6a3 3 0 0 0-3-3H9m1.5-2-2 2 2 2" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                id="discover-search"
                                value={discoverSearchQuery}
                                onChange={handleDiscoverSearchQueryChange}
                                className="border border-gray-300 px-16 text-gray-900 text-sm rounded-lg block w-full ps-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                placeholder="Search Community Name...."
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="p-2.5 ms-2 text-sm font-medium text-white rounded-lg border focus:ring-4 focus:outline-none dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                        >
                            <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                <path stroke="currentColor" d="M19 19l-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                            </svg>
                            <span className="sr-only">Search</span>
                        </button>
                    </form>
                </div>

                {/* ======================= Community Card ======================== */}
                <div className="flex flex-col gap-4 mt-8">
                    {filteredDiscoverCommunityList.length > 0 ? (
                        filteredDiscoverCommunityList.map((community) => (
                            <div className="items-center bg-gray-50 rounded-lg shadow sm:flex dark:bg-gray-700 dark:border-gray-200" key={community._id}>
                                <div className="p-5">
                                    <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                                        <a href="#">{community.name}</a>
                                    </h3>
                                    <span className="text-gray-500 dark:text-gray-400">{}</span>
                                    <p className="mt-3 mb-4 font-light text-gray-500 dark:text-gray-400">{community.about}</p>
                                    <button
                                        onClick={() => joinCommunity(community._id)}
                                        type="button"
                                        className="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none rounded-lg border border-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                                    >
                                        Join Community
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center">No communities found.</p>
                    )}
                </div>
                <button
                    onClick={handleRefresh}
                    className="py-2.5 px-5 mt-4 text-sm font-medium text-white rounded-lg bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none dark:bg-blue-800 dark:hover:bg-blue-900 dark:focus:ring-blue-900"
                >
                    Refresh
                </button>
            </div>

            {/* =================Footer================================= */}
            <div className='mt-8'>
                <hr className="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />
                <Footer />
            </div>
        </div>
    );
};

export default NewCommunity;

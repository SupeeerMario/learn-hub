import React from 'react'
import Sidebar from '../../components/StickyComponent/Side Bar/Sidebar'


const Dashboard = () => {
    return (
        <div>
            <Sidebar></Sidebar>
            <div className=" bg-gray-800 min-h-screen ml-64 pt-24 text-white"> 
            <div className="flex flex-col min-h-screen bg-gray-800 text-white">
      <header className="bg-gray-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* <img src="/placeholder.svg" alt="School Logo" width={40} height={40} className="rounded-full" /> */}
          <div>
            {/* <h1 className="text-lg font-medium">Acme University</h1> */}
            <p className="text-sm text-gray-400">Welcome, Ahmed     </p>
          </div>
        </div>
      </header>
      <main className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        {/* ================Class Matrials ======================== */}
        <div className="bg-gray-700 rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-medium">Class Materials</h2>
          <div className="space-y-2">
            <div className="bg-gray-600 rounded-lg p-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Introduction to Computer Science</h3>
                <p className="text-sm text-gray-400">CSCI 101</p>
              </div>
              <button variant="ghost" size="icon" className="rounded-full">
                {/* <FileIcon className="w-6 h-6" /> */}
              </button>
            </div>
            <div className="bg-gray-600 rounded-lg p-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Calculus I</h3>
                <p className="text-sm text-gray-400">MATH 101</p>
              </div>
              <button variant="ghost" size="icon" className="rounded-full">
                {/* <FileIcon className="w-6 h-6" /> */}
              </button>
            </div>
            <div className="bg-gray-600 rounded-lg p-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Introduction to Psychology</h3>
                <p className="text-sm text-gray-400">PSYC 101</p>
              </div>
              <button variant="ghost" size="icon" className="rounded-full">
                {/* <FileIcon className="w-6 h-6" /> */}
              </button>
            </div>
          </div>
        </div>
        {/* ================Grades=========================== */}
        <div className="bg-gray-700 rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-medium">Grades</h2>
          <div className="space-y-2">
            <div className="bg-gray-600 rounded-lg p-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Intro to Computer Science</h3>
                <p className="text-sm text-gray-400">CSCI 101</p>
                <p className="text-sm text-gray-400">Grade: A-</p>
              </div>
              <button variant="ghost" size="icon" className="rounded-full">
                {/* <FileIcon className="w-6 h-6" /> */}
              </button>
              <button class="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none rounded-lg border border-gray-200  dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">Edit Grades</button>

            </div>
            <div className="bg-gray-600 rounded-lg p-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Calculus I</h3>
                <p className="text-sm text-gray-400">MATH 101</p>
                <p className="text-sm text-gray-400">Grade: B+</p>
              </div>
              <button variant="ghost" size="icon" className="rounded-full">
                {/* <FileIcon className="w-6 h-6" /> */}
              </button>
              <button class="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none rounded-lg border border-gray-200  dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">Edit Grades</button>

            </div>
            <div className="bg-gray-600 rounded-lg p-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Introduction to Psychology</h3>
                <p className="text-sm text-gray-400">PSYC 101</p>
                <p className="text-sm text-gray-400">Grade: A</p>
              </div>
              <button variant="ghost" size="icon" className="rounded-full">
               
              </button>
              <button class="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none rounded-lg border border-gray-200  dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">Edit Grades</button>
            </div>
          </div>
        </div>
      </main>
    </div>

            </div>
        </div>
    )
}

export default Dashboard
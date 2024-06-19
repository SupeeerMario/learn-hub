import React from 'react'
import Sidebar from '../../components/StickyComponent/Side Bar/Sidebar'

const CoursePage = () => {
  return (
    <div>
      <Sidebar></Sidebar>
      <div className=" bg-gray-800 min-h-screen ml-64 pt-24 text-white">
        <div className='p-4'>
          {/* <h1 className='font-semibold text-2xl'>Lecture 1</h1> */}

          <div className="bg-gray-800 text-white">
            <div className="container mx-auto py-12 px-4 md:px-6 lg:px-8">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                
                <div className="relative overflow-hidden rounded-lg">
                <iframe
                                width="100%"
                                height="100%"
                                src="https://www.youtube.com/embed/zpdOGUIw9dA"
                                title="YouTube video player"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen>
                            </iframe>
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 flex items-end p-4">
                    <div>
                      <h2 className="text-2xl font-bold">Introduction to React</h2>
                      <p className="text-sm text-gray-300">Lecture 1</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl font-bold ">Introduction to React</h2>
                    <p className="text-gray-300 mt-2">
                      In this lecture, we will cover the basics of React, including components, state, and props. We will also
                      discuss the advantages of using React for building modern web applications.
                    </p>
                  </div>
                  <button class="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none rounded-lg border border-gray-200  dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">Next Lecture</button>
                  <button class="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none rounded-lg border border-gray-200  dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">Open Quiz</button>
                  <button class="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none rounded-lg border border-gray-200  dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">Add Feedback on the Lecture</button>
                </div>
              </div>

            </div>
            <h1 className='text-3xl py-4'>Lecture text </h1>
            <p> Lorem ipsum dolor sit amet consectetur adipisicing elit. Iusto aut laborum quos harum maiores quisquam laboriosam reprehenderit! Eaque, ea dicta, vero esse repellendus hic, animi sequi architecto blanditiis vitae a.</p>
            <p>lakshflkajhfkjadhgkjadhgkajdsafnakjfhkajhgfkjab kjqwe</p>
            <p> Lorem ipsum dolor sit amet consectetur adipisicing elit. Iusto aut laborum quos harum maiores quisquam laboriosam reprehenderit! Eaque, ea dicta, vero esse repellendus hic, animi sequi architecto blanditiis vitae a.</p>
            <p> Lorem ipsum dolor sit amet consectetur adipisicing elit. Iusto aut laborum quos harum maiores quisquam laboriosam reprehenderit! Eaque, ea dicta, vero esse repellendus hic, animi sequi architecto blanditiis vitae a.</p>
            <p> Lorem ipsum dolor sit amet consectetur adipisicing elit. Iusto aut laborum quos harum maiores quisquam laboriosam reprehenderit! Eaque, ea dicta, vero esse repellendus hic, animi sequi architecto blanditiis vitae a.</p>

          </div>
        </div>
      </div>
    </div>
  )
}

export default CoursePage
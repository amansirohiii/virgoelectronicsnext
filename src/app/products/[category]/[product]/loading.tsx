import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'
const loading = () => {
  return (
    <div className="container m-auto mt-4 xl:px-14 md:px-12 px-8 min-h-screen">
             <Skeleton className="h-[25px] w-[250px] rounded-xl" />


      <div className="container px-5 py-24 mx-auto">

<div className="lg:w-4/5 mx-auto flex flex-wrap gap-2">
        <Skeleton className="lg:w-[49%] w-full h-96 lg:pl-10 lg:py-6 mt-6 lg:mt-0 "/>
        <Skeleton className="lg:w-[49%] w-full h-96 lg:pl-10 lg:py-6 mt-6 lg:mt-0"/>

          <Skeleton className="text-gray-900 text-3xl title-font font-medium mb-1"/>

          <p className="leading-relaxed"> </p>
          <Skeleton className="flex mt-6 items-center pb-5 border-b-2 border-gray-100 mb-5"/>



          <div className="flex flex-col ">

          </div>

       </div>
       </div>
      </div>
    )
}

export default loading
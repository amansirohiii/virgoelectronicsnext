import React from 'react'
import { Skeleton } from "@/components/ui/skeleton"

const loading = () => {
  return (
<div>
          <div className="relative w-full  h-96">
          <Skeleton className="h-[125px] w-[250px] rounded-xl" />
          </div>
          <div className="container m-auto mt-4 xl:px-14 md:px-12 px-8 min-h-screen">


        <h1 className="text-center text-2xl font-bold">

        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full gap-3">

        </div>
      </div>
      </div>  )
}

export default loading
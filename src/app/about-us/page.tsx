import Image from 'next/image'
import React from 'react'
import "./page.css";
const page = () => {
  return (
    <div>    <section className="py-14 lg:py-24 relative z-0 bg-gray-50">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative text-center">
        <h1
            className="max-w-2xl mx-auto text-center font-manrope font-bold text-4xl  text-gray-900 mb-5 md:text-5xl md:leading-normal">
            Virgo Electronics <span className="text-indigo-600">
              Ghaziabad </span>
        </h1>
        <p className="max-w-sm mx-auto text-center text-base font-normal leading-7 text-gray-500 mb-9">Manufacturer of Electrical Appliances</p>


    </div>
</section>

<section className="py-14 lg:py-24 relative">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative ">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-9">
            <div className="img-box ">
                <Image src="/virgo.png" alt="virgo logo" width={200} height={200}
                    className="max-lg:mx-auto "/>
            </div>
            <div className="lg:pl-[100px] flex items-center">
                <div className="data w-full">
                    <h2
                        className="font-manrope font-bold text-4xl lg:text-5xl text-black mb-9 max-lg:text-center relative">
                        About
                        Us </h2>
                    <p className="font-normal text-xl leading-8 text-gray-500 max-lg:text-center max-w-2xl mx-auto">
                    Virgo has been known for its quality Electrical Appliances. We are one of the leading manufactrures and are notable for our reliable, durable and performance-worthy appliances. The journey of the company began by Mr. Naresh Chand in 2000, when it was established as a small business. Since then, the product advancement and high-quality appliances delivered by us, has always boosted our pace in the market.
                    </p>
                </div>
            </div>
        </div>
    </div>
</section>

<section className="py-14 lg:py-24 relative mt-20">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative ">
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-9 ">

            <div className="lg:pr-24 flex items-center">
                <div className="data w-full">
                    <Image src="/virgo.png" alt="virgo logo" width={300} height={300}
                        className="block lg:hidden mb-9 mx-auto "/>
                    <h2 className="font-manrope font-bold text-4xl lg:text-5xl text-black mb-9 max-lg:text-center">We
                        are Creative Since 2001</h2>
                    <p className="font-normal text-xl leading-8 text-gray-500 max-lg:text-center max-w-2xl mx-auto">
                    With our rich history of quality and reliability, we have, over the years, also earned the trust and reputation from our clients. When it comes to meeting the standards of the industry, staying at par with the quality, our appliances remain at the forefront. Adapting new technologies, exploring quality prospects to develop advanced appliances, remains our continuous motto. Manufacturing electrical home appliances like ceiling fans, table fans, water heater, room heater etc., we understand our responsibility towards our customers. We own our manufacturing plants in (MG Road Industrial Area) (Uttar Pradesh) for meeting the standards and the demands of quality appliances.
                    </p>
                </div>
            </div>
            <div className="img-box ">
                <Image src="/virgo.png" alt="About Us tailwind page" width={200} height={200}
                    className="hidden lg:block w-80 "/>
            </div>
        </div>
    </div>
</section>

<section className="py-20 bg-white">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="font-manrope text-4xl text-center text-gray-900 font-bold mb-14">Our results in numbers</h2>
        <div className="flex flex-col gap-5 xl:gap-8 lg:flex-row lg:justify-between">
            <div
                className="w-full max-lg:max-w-2xl mx-auto lg:mx-0 lg:w-1/3 bg-white p-6 rounded-2xl shadow-md shadow-gray-100">
                <div className="flex gap-5">
                    <div className="font-manrope text-2xl font-bold text-indigo-600">
                        240%
                    </div>
                    <div className="flex-1">
                        <h4 className="text-xl text-gray-900 font-semibold mb-2">Company growth</h4>
                        <p className="text-xs text-gray-500 leading-5">Company&apos;s remarkable growth journey as we
                            continually innovate and drive towards new heights of success.</p>
                    </div>
                </div>
            </div>
            <div
                className="w-full max-lg:max-w-2xl mx-auto lg:mx-0 lg:w-1/3 bg-white p-6 rounded-2xl shadow-md shadow-gray-100">
                <div className="flex gap-5">
                    <div className="font-manrope text-2xl font-bold text-indigo-600">
                        175+
                    </div>
                    <div className="flex-1">
                        <h4 className="text-xl text-gray-900 font-semibold mb-2">Company growth</h4>
                        <p className="text-xs text-gray-500 leading-5">Our very talented team members are the powerhouse
                            of pagedone and pillars of our success. </p>
                    </div>
                </div>
            </div>
            <div
                className="w-full max-lg:max-w-2xl mx-auto lg:mx-0 lg:w-1/3 bg-white p-6 rounded-2xl shadow-md shadow-gray-100">
                <div className="flex gap-5">
                    <div className="font-manrope text-2xl font-bold text-indigo-600">
                        625+
                    </div>
                    <div className="flex-1">
                        <h4 className="text-xl text-gray-900 font-semibold mb-2">Projects Completed</h4>
                        <p className="text-xs text-gray-500 leading-5">We have accomplished more than 625 projects
                            worldwide and we are still counting many more.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

{/* <section className=" py-14 lg:py-24 bg-gray-50">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
      <div className="mb-16 rounded-full">
        <h2 className="text-4xl font-manrope font-bold text-gray-900 text-center">What our happy user says!</h2>
      </div>

      <div className="swiper mySwiper2">
        <div className="swiper-wrapper">
          <div className="swiper-slide">
            <div className="relative mb-20">
              <div className="max-w-max mx-auto lg:max-w-4xl">
                <p className="text-lg text-gray-500 leading-8 mb-8 text-center">
                  I have been using pagedone for several months now, and I must say that it has made my life a lot
                  easier. The
                  platform&apos;s intuitive interface and ease of use have allowed me to manage my finances more effectively
                  and
                  make informed investment decisions. I particularly like the product&apos;s auto-tracking feature, which has
                  saved
                  me a lot of time and effort.
                </p>
              </div>
            </div>
          </div>
          <div className="swiper-slide">
            <div className="relative mb-20">
              <div className="max-w-max mx-auto lg:max-w-4xl">
                <p className="text-lg text-gray-500 leading-8 mb-8 text-center">
                  I have been using pagedone for several months now, and I must say that it has made my life a lot
                  easier. The
                  platform&apos;s intuitive interface and ease of use have allowed me to manage my finances more effectively
                  and
                  make informed investment decisions. I particularly like the product&apos;s auto-tracking feature, which has
                  saved
                  me a lot of time and effort.
                </p>
              </div>
            </div>
          </div>
          <div className="swiper-slide">
            <div className="relative mb-20">
              <div className="max-w-max mx-auto lg:max-w-4xl">
                <p className="text-lg text-gray-500 leading-8 mb-8 text-center">
                  I have been using pagedone for several months now, and I must say that it has made my life a lot
                  easier. The
                  platform&apos;s intuitive interface and ease of use have allowed me to manage my finances more effectively
                  and
                  make informed investment decisions. I particularly like the product&apos;s auto-tracking feature, which has
                  saved
                  me a lot of time and effort.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>



    </div>
  </section> */}
  </div>
  )
}


export default page
// pages/products/[category]/index.tsx
import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NotFound from "@/app/not-found";
import { productCategories, products } from "@/utils/data";
import type { Metadata, ResolvingMetadata } from 'next'

interface Product {
  id: number;
  category: string;
  image: string;
  model: string;
  specs: string;
  color?: string;
  sweep?: string;
  bearing?: string;
  link: string;
}

const Card = ({ product }: any) => {
  return (
    <div className="group my-10 flex w-full max-w-xs flex-col overflow-hidden rounded-lg border border-gray-100 bg-white shadow-md">
      <div className="relative mx-3 mt-3 flex h-80 overflow-hidden rounded-xl">
        <Suspense>
          <Image
            src={product.image}
            alt="logo"
            fill
            priority
            className="peer absolute top-0 right-0 h-full w-full "
          />
        </Suspense>

      </div>
      <div className="mt-4 px-5 pb-5">

        <h1 className="flex items-center justify-center rounded-md bg-slate-900 px-5 py-2.5 text-center font-medium text-white focus:outline-none focus:ring-4 focus:ring-blue-300 text-xl">
          {product.model}
        </h1>
      </div>
    </div>
  );
};

 const CategoryPage = async({ params }: { params: { category: string } }) => {
  const category = params.category;
  const categoryProducts = await products.filter(
    (product) => product.category === category
  );
  if(categoryProducts.length==0) return NotFound();
  const {banner} = await productCategories.filter((product) => product.slug === category)[0];
  return (

        <div>
          <div className="relative w-full h-36 sm:h-96 sm:mt-20">
            <Image
              src={banner}
              alt="banner"
              fill
              className=""
            />
          </div>
          <div className="container m-auto mt-4 xl:px-14 md:px-12 px-8 min-h-screen">

        <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1">
                <BreadcrumbEllipsis className="h-4 w-4" />
                <span className="sr-only">Toggle menu</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem>
                 <BreadcrumbLink href="/products/"> All Category</BreadcrumbLink>
                </DropdownMenuItem>
                {/* <DropdownMenuItem>Themes</DropdownMenuItem>
              <DropdownMenuItem>GitHub</DropdownMenuItem> */}
              </DropdownMenuContent>
            </DropdownMenu>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
              <BreadcrumbPage>{category}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="text-center text-2xl font-bold">
          {category.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full gap-3">
          {categoryProducts.map((product) => (
            <Link key={product.id} href={product.link}>
              <Card product={product} />
            </Link>
          ))}
        </div>
      </div>
      </div>
  );
};
type Props = {
  params: { category: string }
  searchParams: { [key: string]: string | string[] | undefined }
}
export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // read route params
  console.log(searchParams);
  const data = await products.filter((product) => product.category === params.category)[0];

  return {
    title: ` ${data?.category.replace("-", " ").toUpperCase()} Manufacturer Ghaziabad, Virgo Electronics`,
    openGraph: {
description: data?.description    },
  }
}

export default CategoryPage;

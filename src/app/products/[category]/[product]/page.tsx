import { products } from "@/utils/data";
import { notFound } from "next/navigation";
import Image from "next/image";
import { BackgroundBeams } from "@/components/ui/background-beams";
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
import { usePathname } from "next/navigation";
import Link from "next/link";

async function ProductPage({ params }: { params: { product: string } }) {
  const product = params.product;
  const selectedProducts = await products.filter(
    (item) => item.model.toLowerCase().split(" ").join("-") === product
  );
  const selectedProduct = selectedProducts[0];

  return (
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
                 <BreadcrumbLink href="/products/all"> All Products</BreadcrumbLink>
                </DropdownMenuItem>
                {/* <DropdownMenuItem>Themes</DropdownMenuItem>
              <DropdownMenuItem>GitHub</DropdownMenuItem> */}
              </DropdownMenuContent>
            </DropdownMenu>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/products/${selectedProduct.category}`>
              {selectedProduct?.category}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{selectedProduct?.model}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="container px-5 py-24 mx-auto">
        <div className="lg:w-4/5 mx-auto flex flex-wrap">
          <Image
            src={selectedProduct?.image}
            alt="logo"
            width={150}
            height={80}
            priority
            className="lg:w-1/2 w-full lg:h-auto h-64 object-cover object-center rounded"
          />
          <div className="lg:w-1/2 w-full lg:pl-10 lg:py-6 mt-6 lg:mt-0">
            {/* <h2 className="text-sm title-font text-gray-500 tracking-widest">
                ON SALE
              </h2> */}
            <h1 className="text-gray-900 text-3xl title-font font-medium mb-1">
              {selectedProduct.model}
            </h1>

            <p className="leading-relaxed">{selectedProduct.specs}</p>
            <div className="flex mt-6 items-center pb-5 border-b-2 border-gray-100 mb-5">
              <div className="flex">
                <span className="mr-3">Color</span>
                <button className="border-2 border-gray-300 rounded-full w-6 h-6 focus:outline-none"></button>
                <button className="border-2 border-gray-300 ml-1 bg-gray-700 rounded-full w-6 h-6 focus:outline-none"></button>
                <button className="border-2 border-gray-300 ml-1 bg-indigo-500 rounded-full w-6 h-6 focus:outline-none"></button>
              </div>
              <div className="flex ml-6 items-center">
                <span className="mr-3">Size</span>
                <div className="relative">
                  <select className="rounded border appearance-none border-gray-300 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 text-base pl-3 pr-10">
                    <option>SM</option>
                    <option>M</option>
                    <option>L</option>
                    <option>XL</option>
                  </select>
                  <span className="absolute right-0 top-0 h-full w-10 text-center text-gray-600 pointer-events-none flex items-center justify-center">
                    <svg
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                    >
                      <path d="M6 9l6 6 6-6"></path>
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <BackgroundBeams /> */}
    </div>
  );
}

export default ProductPage;

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

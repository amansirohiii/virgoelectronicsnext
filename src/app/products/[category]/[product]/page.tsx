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
import type { Metadata, ResolvingMetadata } from 'next'


async function ProductPage({ params }: { params: { product: string } }) {
  const product = params.product;
  const selectedProducts = await products.filter(
    (item) => item.model.toLowerCase().split(" ").join("-").replace("''", "") === product
  );
  if (selectedProducts.length == 0) return notFound();
  const selectedProduct = selectedProducts[0];
  const {
    id,
    link,
    category,
    image,
    model,
    description,
    color,
    sweep,
    bearing,
    winding,
    fan,
    decoration,
    body,
    blade,
    size,
    motor,
    capacity,
    input,
    purpose,
    parda,
    power,
    pump,
  } = selectedProduct;

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
                  <BreadcrumbLink href="/products/">
                    All Category
                  </BreadcrumbLink>
                </DropdownMenuItem>
                {/* <DropdownMenuItem>Themes</DropdownMenuItem>
              <DropdownMenuItem>GitHub</DropdownMenuItem> */}
              </DropdownMenuContent>
            </DropdownMenu>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/products/${category}`}>
              {category}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{model}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="container px-5 py-24 mx-auto">
        <div className="lg:w-4/5 mx-auto flex flex-wrap">
          <Image
            src={image}
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
              {model}
            </h1>

            <p className="leading-relaxed">{description}</p>
            <div className="flex mt-6 items-center pb-5 border-b-2 border-gray-100 mb-5">
              {color?.length > 0 && (
                <div className="flex">
                  <span className="mr-3">Colors:</span>
                  {color.map((color, index) => (
                    <button
                      key={id + index}
                      title={color}
                      className={`border-2 border-gray-300 ml-1 bg-${color.toLowerCase()} rounded-full w-6 h-6 focus:outline-none`}
                    ></button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-col ">
              {[
                "sweep",
                "bearing",
                "winding",
                "fan",
                "decoration",
                "body",
                "blade",
                "size",
                "motor",
                "capacity",
                "input",
                "purpose",
                "parda",
                "power",
                "pump",
              ].map(
                (property: any) =>
                  selectedProduct[property] && (
                    <div key={property} className="flex">
                      <span className="mr-3 flex">
                        {property[0].toUpperCase() + property.slice(1)}:
                      </span>
                      <span className="text-gray-500">
                        {selectedProduct[property]}
                      </span>
                    </div>
                  )
              )}
            </div>
          </div>
        </div>
      </div>
      {/* <BackgroundBeams /> */}
    </div>
  );
}


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
    title: `${data.model}, Best ${data.category.replace("-", " ").toUpperCase()} Ghaziabad, Virgo Electronics`,
    openGraph: {
description: "hello"    },
  }
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

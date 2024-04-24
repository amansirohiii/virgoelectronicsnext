// pages/products/[category]/index.tsx

import { useRouter } from 'next/router';
import { products } from '@/utils/data';
import Link from 'next/link';
import Layout from '@/components/Layout';

const CategoryPage = () => {
  const router = useRouter();
  const { category } = router.query;
  console.log(category)
  // Find products for the current category
  const categoryProducts = products.filter(product => product.category === category);

  return (
   <Layout> <div>
   <h1>Products in {category}</h1>
   <ul>
     {categoryProducts.map(product => (
       <li key={product.id}>
         <Link href={`${product.link}`}>{product.model}</Link>
       </li>
     ))}
   </ul>
 </div></Layout>
  );
};

export default CategoryPage;

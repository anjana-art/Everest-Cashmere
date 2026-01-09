import { stripe } from "@/lib/stripe";
import { ProductList } from "@/components/product-list";

export default async function Products(){
     
       const products = await stripe.products.list({
            expand: ["data.default_price"],
    
         })

    return(
        <div>            <h1 className=" text-2xl text-gray-600 text-center py-5 ">All Products</h1>

            <ProductList products={products.data}/>   
               </div>
    )
}
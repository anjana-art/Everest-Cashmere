import Image from "next/image"
import styles from "./page.module.css";
import { stripe } from "@/lib/stripe";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {Carousel} from "@/components/carousel";
import { ProductList } from "@/components/product-list";

export default async function Home(){
        
     const products = await stripe.products.list({
        expand: ["data.default_price"],
        limit: 4,

     })
        
    return(
        <div> 
           <section className=" rounded bg-neutral-100 py-8 items-center sm:py-12 ">
            <div className="mx-auto grid grid-cols-1 items-center justify-items-center gap-8 px-8 sm:px-16  md:grid-cols-2">
               <div className="max-w-md space-y-4">
                <h1 className="text-3xl font-bold tracking-tight md:text-4xl text-red-900">Welcome to Everesté!</h1>
                <p  className="text-neutral-600">Discover the timeless elegance with style.Pure Cashmere. handmade with love, 
                   wrapped under the mountain and  direct to  your closet . suppor sustanable , luxury and timeless fashion from 
                   Everesté. because we care  Enviroment friendly, local artician and your comfort along with style. </p>
               
               <Button asChild className=" text-2xl inline-flex items-center justify-center rounded-full px-6 py-3 text-white bg-amber-600 hover:bg-amber-500 "
>
                <Link href={"/products"}
                className="inline-flex items-center justify-center rounded-full px-6 py-3">Browse all Products</Link>
               </Button>

            </div>

            <Image alt="Banner Image" width={250} height={250} className="rounded" src={products.data[2]?.images?.[0] || "/placeholder-image.jpg"}/>
           </div>
           </section>

           <section  className="py-8">
                <Carousel products={products?.data || []} />

           </section>
        </div>
    )
}
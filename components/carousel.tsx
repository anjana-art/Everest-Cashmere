'use client';
import Stripe from "stripe";
import { Card, CardContent, CardTitle } from "./ui/card";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "./ui/button";
import Link from "next/link";

interface Props {
    products: Stripe.Product[];
}

export const Carousel = ({ products = [] }: Props) => {
    const [current, setCurrent] = useState<number>(0);
    
     useEffect(() => {
        if (products.length === 0) return; // Guard clause
        
        const interval = setInterval(() => {
            setCurrent((prev) => (prev + 1) % products.length);
        }, 3000);
  
        return () => clearInterval(interval);
    }, [products.length]);

    // Add early return for empty products
    if (!products || products.length === 0) {
        return (
            <Card className="flex flex-col relative overflow-hidden rounded-lg shadow-md border-gray-300 min-h-80">
                <div className="relative h-80 w-full aspect-video bg-gray-100 flex items-center justify-center">
                    <p className="text-gray-500">No products available</p>
                </div>
            </Card>
        );
    }

      

    const currentProduct = products[current];
    const price = currentProduct?.default_price as Stripe.Price | undefined;

    return (
        <Link href={'/products'}>
            <Card className="flex flex-col relative overflow-hidden rounded-lg shadow-md border-gray-300">
                {currentProduct?.images?.[0] ? (
                    <div className="relative h-80 w-full aspect-video bg-gray-100">
                        <Image
                            src={currentProduct.images[0]}
                            alt={currentProduct.name || "Product image"}
                            fill
                            style={{ objectFit: "contain" }}
                            className="transition-opacity duration-500 ease-in-out"
                        />
                    </div>
                ) : (
                    <div className="relative h-80 w-full aspect-video bg-gray-100 flex items-center justify-center">
                        <p className="text-gray-500">No image available</p>
                    </div>
                )}
                
                <CardContent className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50">
                    <CardTitle className="text-3xl font-bold text-amber-600 mb-2">
                        {currentProduct?.name || "Product Name"}
                    </CardTitle>
                    {price?.unit_amount && (
                        <p className="text-xl font-medium text-gray-600">
                            ${(price.unit_amount / 100).toFixed(2)}
                        </p>
                    )}
                </CardContent>
            </Card>
        </Link>
    );
};



/* 'use client';
import Stripe from "stripe";
import { Card, CardContent, CardTitle } from "./ui/card";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "./ui/button";
import Link from "next/link";

 interface Props{
        products:Stripe.Product[];
    }
   

 export const Carousel = ({products}:Props)=>{
     const[current , setCurrent] = useState<number>(0)

     useEffect(()=>{
          const interval = setInterval(()=>{
        setCurrent((prev)=> (prev+1) % products.length)
          }, 3000)
             
        return ()=>clearInterval(interval)

     },[products.length])

     const currentProduct = products[current]
     const price = currentProduct.default_price as Stripe.Price
    
     return (
    <Link href={'/products'}>
    <Card className=" flex flex-col relative overflow-hidden rounded-lg shadow-md border-gray-300">
                    

              
                    
      {currentProduct.images && currentProduct.images[0] && (
        <div className="relative h-80 w-full  aspect-video bg-gray-100">
          <Image
            src={currentProduct.images[0]}
            alt={currentProduct.name}
            layout="fill"
            objectFit="contain"
            className="transition-opacity duration-500 ease-in-out"
          />
        </div>
      )}
      <CardContent className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50">
        <CardTitle className="text-3xl font-bold text-amber-600 mb-2">
          {currentProduct.name}
        </CardTitle>
        {price && price.unit_amount && (
          <p className="text-xl font-medium text-gray-600">
            ${(price.unit_amount / 100).toFixed(2)}
          </p>
        )}
      </CardContent>
    </Card>
    </Link>
  );
    
}

 */
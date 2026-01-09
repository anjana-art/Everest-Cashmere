'use client';
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";
import Link from "next/link";
import { useEffect } from "react";



export default function Success(){
    const {clearCart} = useCartStore();

    useEffect(()=>{
       clearCart();
        },[clearCart]);

    return <div className="text-center text-pink-950 p-10 m-10 space-x-3 space-y-2">  <h1 className="text-2xl font-mono text-center"> Your Payment is Successful!! Thankyou for Your Purchase. Your Order is being Proccessed.</h1>

    <Link href="/products"><Button className="bg-amber-100 text-black  hover:bg-amber-200 border-2 shadow">Continue Shopping</Button></Link>
    <Link href="/"><Button className="bg-amber-100 text-black   hover:bg-amber-200 border-2 shadow">View Order Details</Button></Link>

    </div>
}
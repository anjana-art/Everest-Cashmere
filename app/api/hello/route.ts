import { NextResponse } from "next/server";

export async function GET(){
   return NextResponse.json({message:"Hello from API..."})
} 

export async function POST(req : Request){
    const data = await req.json();
    const {name}= data;
   return NextResponse.json({message:`Hello ${name}, This was sent from the Api`})
} 
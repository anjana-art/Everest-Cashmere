"use client"

import { useState } from "react";

async function makePostRequest() {
    const res = await fetch("/api/hello/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        }   ,
        body: JSON.stringify({name:"Pedro"}) },
    
    )
       const data = await res.json(); 
       return data;     
}

export default  function Friends() {
    const [message, setMessage] = useState("");
    const onClick = async() =>{
    const { message } = await makePostRequest();

         setMessage(message);

    }


   return <h1>Hey My friend {message} <button onClick={onClick}>Click Here</button></h1>
}
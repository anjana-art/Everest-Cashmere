import Link from "next/link"
export default function NotFoundPage(){
    return(
        <div style={{textAlign:"center", padding:"50px"}}>
        <h1 style={{fontSize:"3rem", color:"red"}}>404 - Page Not Found</h1>

        <p >Oops! The page you are looking for does not exist.</p>

        <Link href="/" style={{color:"purple", textDecoration:"underline"}}>Go Back To Home</Link>
        </div>
    )
}
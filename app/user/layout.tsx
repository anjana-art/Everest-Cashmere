export default function UserLayout({children,}:{children: React.ReactNode; }){
return(
 <div>
        <h1 style={{fontSize:"1rem", color:"red"}}>This is user Layout </h1>
         {children}
 </div>
)
}
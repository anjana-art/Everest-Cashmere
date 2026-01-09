import "tailwindcss";


export default async function User(){
  const res = await fetch("http://jsonplaceholder.typicode.com/users");
  const user = await res.json();


    return(
        <div>
          <h1 className="text-2xl text-red-500">User List</h1>
           <ul>
                

           </ul>{user.map((user: {id:number; name:string;})=>(
            <li  key={user.id}><h3>{user.name}</h3></li>
           ))}

        </div>
    )
}
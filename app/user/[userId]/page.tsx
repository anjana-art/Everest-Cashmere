import { notFound } from "next/navigation";
import { json } from "stream/consumers";

async function fetchUser(id:string) {
    const res = await fetch(`http://jsonplaceholder.typicode.com/users/${id}`);

    if(!res.ok){
        return null;
    }
     
    const user = await res.json();
    return user;
}

export default async function UserPage({
    params,
}:{
    params: Promise<{userId:string}>
}
){
   const {userId} = await params;
   const user = await fetchUser(userId);

   if (!user){
    notFound();
   }

    return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header with gradient */}
          <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>
          
          {/* Profile Content */}
          <div className="relative px-8 pb-8">
            {/* Avatar */}
            <div className="absolute -top-16 left-1/2 transform -translate-x-1/2">
              <div className="w-32 h-32 rounded-full border-4 border-white bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg">
                <span className="text-5xl font-bold text-white">
                  {user.name.charAt(0)}
                </span>
              </div>
            </div>
            
            {/* User Info */}
            <div className="pt-20 text-center">
              <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-500 mt-2">@{user.username}</p>
              
              {/* Contact */}
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-center text-gray-600">
                  <svg className="w-5 h-5 mr-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  {user.email}
                </div>
                
                <div className="flex items-center justify-center text-gray-600">
                  <svg className="w-5 h-5 mr-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  {user.phone}
                </div>
              </div>
              
              {/* Address & Company */}
              <div className="mt-8 grid gap-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-800 mb-3">📍 Address</h3>
                  <p className="text-gray-600">{user.address.street}</p>
                  <p className="text-gray-600">{user.address.suite}</p>
                  <p className="text-gray-600">{user.address.city}, {user.address.zipcode}</p>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-800 mb-3">🏢 Company</h3>
                  <p className="text-lg font-medium text-gray-900">{user.company.name}</p>
                  <p className="text-gray-600 mt-2 italic">"{user.company.catchPhrase}"</p>
                </div>
              </div>
              
              {/* Website Button */}
              <a 
                href={`https://${user.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center justify-center w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                Visit {user.website}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
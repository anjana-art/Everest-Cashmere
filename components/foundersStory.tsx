// components/FoundersStory.jsx
export default function FoundersStory() {
  console.log('hey is this on client or in server ...');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Decorative header */}
      <div className="text-center mb-12">
        <div className="inline-block">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 relative">
            Founder's Story
            <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-amber-500 rounded-full"></span>
          </h1>
        </div>
        <p className="text-lg text-amber-600 font-medium mt-6">Anjana Bhatta</p>
      </div>

      {/* Story content */}
      <div className="space-y-8 text-gray-700 leading-relaxed">
        {/* Opening paragraph */}
        <div className="bg-amber-50 p-8 rounded-2xl border-l-4 border-amber-500 shadow-sm">
          <p className="text-lg first-letter:text-4xl first-letter:font-bold first-letter:text-amber-600 first-letter:mr-2 first-letter:float-left">
            Storytelling has always been a part of my life. This is my lifetime story — a journey of becoming — 
            shared with anyone who feels curious enough to listen.
          </p>
        </div>

        <div className="grid gap-6">
          {/* Arrival story */}
          <p className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
            <span className="font-semibold text-amber-700">🇳🇵🇵🇹 </span>
            Hi, my name is Anjana Bhatta. I still remember the day I arrived in Portugal in 2016. There was hope, 
            a little fear of the unknown, but mostly the dreams of a 23-year-old girl imagining what life could become. 
            It felt almost like a beautiful vacation at first, as I explored Lisbon and nearby beaches with my then 
            boyfriend, now husband. Yet beneath that excitement was the quiet beginning of a life-changing journey.
          </p>

          {/* Learning */}
          <p className="bg-amber-50/50 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
            <span className="font-semibold text-amber-700">📚 </span>
            From the beginning, I was determined to learn and adapt. I joined language classes at the University of Lisbon 
            while working in table service. Speaking with customers every day accelerated my understanding of the Portuguese 
            language and culture. Through daily interactions, I slowly found confidence, connection, and a sense of belonging.
          </p>

          {/* Connection with people */}
          <p className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
            <span className="font-semibold text-amber-700">💕 </span>
            I have always found Portuguese people warm, welcoming, and kind. Their curiosity about me and my origin naturally 
            led me to share my story again and again — sometimes many times in a single day. Over the years, storytelling became 
            more than conversation; it became part of who I am.
          </p>

          {/* Growth reflection */}
          <p className="bg-amber-50/50 p-6 rounded-xl italic text-gray-600 border-l-4 border-amber-300">
            Now, as I begin my business journey, I reflect on almost a decade of learning and growing here — from understanding 
            a new language and culture, to driving, to coding, and now building something of my own. I see myself as a lifelong 
            learner, committed to discovering purpose and delivering my best service with sincerity and grace.
          </p>

          {/* Pride */}
          <p className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
            <span className="font-semibold text-amber-700">✨ </span>
            I am deeply proud of the path that has brought me here. From the early days of struggling to understand café orders 
            to now preparing to launch my own business, this journey has been built on sacrifice, hope, belief, hard work, 
            sleepless nights, and a strong willingness to find meaning and purpose.
          </p>

          {/* Brand connection */}
          <p className="bg-amber-50/50 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
            <span className="font-semibold text-amber-700">🧶 </span>
            Starting a Nepalese cashmere and wool garment business feels deeply aligned with my true nature. I am a grounded 
            person with a strong connection to my origin, and this venture allows me to honor that connection while sharing 
            it with the world.

            Growing up connected to Nepalese craftsmanship and natural wool, bringing these timeless materials to Europe feels 
            like bringing a piece of home with me. It is not only about clothing, but about carrying forward a tradition of warmth, 
            patience, and skilled hands that create something meaningful and lasting.
          </p>

          {/* Family support */}
          <div className="bg-gradient-to-r from-amber-50 to-white p-8 rounded-2xl border border-amber-200 shadow-md mt-4">
            <p className="mb-6">
              <span className="font-semibold text-amber-700">🙏 </span>
              Before speaking more about my work, I want to express my deepest gratitude to my beloved husband,{" "}
              <span className="font-semibold text-amber-700">Dipak Shrestha</span>. He has been an incredible supporter 
              through every step of this journey. My dream has taken shape in reality because of his belief in me, especially 
              in moments when I doubted myself. Today, we grow together as partners in life and in purpose. He supports the 
              business through digital marketing and wherever the company needs strength.
            </p>

            <p className="pt-4 border-t border-amber-200">
              <span className="font-semibold text-amber-700">🤝 </span>
              I am also grateful to my family in Nepal, especially my brother{" "}
              <span className="font-semibold text-amber-700">Keshav Bhatta</span>, who manages manufacturing coordination and 
              offers guidance as my business adviser. With such a strong foundation of support, I feel fortunate and confident 
              in my ability to deliver quality products and meaningful service to everyone who connects with this brand.
            </p>
          </div>

          {/* Premium confidence paragraph */}
          <p className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
            Today, I am building a brand that connects two worlds — the craftsmanship of Nepal and the conscious lifestyle 
            of Europe. What began as a personal journey has grown into a meaningful mission: to bring timeless materials, 
            thoughtful design, and honest craftsmanship to people who value quality and the story behind what they wear.
          </p>

          {/* Closing */}
          <div className="text-center mt-8">
            <p className="inline-block bg-amber-500 text-white px-8 py-4 rounded-full text-lg font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
              Thank you for taking the time to read my story. 💫
            </p>
            <p className="mt-3 text-gray-600">It truly means a lot.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center text-gray-400 text-sm">
        <div className="flex justify-center space-x-2">
          <span>✦</span>
          <span>✦</span>
          <span>✦</span>
        </div>
        <p className="mt-2 text-amber-600 font-medium">
          From Nepal with love — Portugal, 2016 to present.
        </p>
      </div>
    </div>
  );
}

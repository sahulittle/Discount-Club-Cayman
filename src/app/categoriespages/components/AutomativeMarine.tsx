import React from 'react'

const stores = [
  {
    id: 1,
    name: "Tony's Toys",
    image: "https://placehold.co/600x400?text=Tony's+Toys",
    description: "Premier automotive center in Cayman offering sales, leasing, and a full-service garage for all makes and models."
  },
  {
    id: 2,
    name: "Kirk Marine",
    image: "https://placehold.co/600x400?text=Kirk+Marine",
    description: "The leading marine retailer in the Cayman Islands, stocking boats, waverunners, fishing tackle, and marine hardware."
  },
  {
    id: 3,
    name: "Vampt Motors",
    image: "https://placehold.co/600x400?text=Vampt+Motors",
    description: "Authorized dealer for Toyota and Ford. Providing new vehicle sales, genuine parts, and certified service."
  },
  {
    id: 4,
    name: "Harbour House Marina",
    image: "https://placehold.co/600x400?text=Harbour+House",
    description: "Full-service marina with a 150-ton travel lift, boat yard, chandlery, and expert repair services."
  },
  {
    id: 5,
    name: "GT Automotive",
    image: "https://placehold.co/600x400?text=GT+Automotive",
    description: "Authorized distributor for BMW, MINI, and Kia. Dedicated to delivering excellence in automotive sales and service."
  },
  {
    id: 6,
    name: "Car City",
    image: "https://placehold.co/600x400?text=Car+City",
    description: "Your destination for Honda, Mitsubishi, Mercedes-Benz, and Suzuki vehicles in the Cayman Islands."
  }
];

export const AutomativeMarine = () => {
  return (
    <div id="automotive-marine" className="container mx-auto px-4 py-8 -mt-24">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Automotive & Marine</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {stores.map((store) => (
          <div key={store.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="h-48 overflow-hidden">
              <img 
                src={store.image} 
                alt={store.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2 text-gray-900">{store.name}</h3>
              <p className="text-gray-600 mb-4 line-clamp-3">
                {store.description}
              </p>
              <button className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded hover:bg-blue-700 transition-colors">
                Visit Store
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

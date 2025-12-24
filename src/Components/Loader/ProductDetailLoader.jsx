import React from 'react'

const ProductDetailLoader = () => {
  return (
        <div className="min-h-screen bg-gray-50 py-12 animate-pulse">
            <div className="p-4 max-w-[1500px] mx-auto">

                
                <div className="h-4 w-64 bg-gray-200 rounded mb-6"></div>

                <div className="bg-white rounded shadow p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                      
                        <div>
                            <div className="w-full h-96 bg-gray-200 rounded"></div>

                            <div className="flex gap-3 mt-4">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="w-20 h-20 bg-gray-200 rounded"></div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <div className="h-8 w-3/4 bg-gray-200 rounded mb-4"></div>
                            <div className="h-4 w-32 bg-gray-200 rounded mb-3"></div>

                            <div className="flex gap-2 mb-4">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="w-4 h-4 bg-gray-300 rounded"></div>
                                ))}
                            </div>

                            <div className="h-8 w-40 bg-gray-200 rounded mb-6"></div>

                            <div className="flex gap-4 mb-6">
                                <div className="h-12 w-40 bg-gray-300 rounded"></div>
                                <div className="h-12 w-40 bg-gray-300 rounded"></div>
                            </div>

                            <div className="h-4 w-48 bg-gray-200 rounded mb-2"></div>
                            <div className="h-4 w-32 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductDetailLoader
function ProfileLoader() {
  return (
    <div className="min-h-screen mt-[100px] bg-gray-50 py-12 animate-pulse">
      <div className="max-w-4xl mx-auto bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">

          
          <div className="flex flex-col items-center md:items-start">
            <div className="w-36 h-36 rounded-full bg-gray-200" />
            <div className="mt-3 h-6 w-24 bg-gray-200 rounded" />
          </div>

        
          <div className="md:col-span-2 w-full">
            <div className="flex items-center justify-between mb-6">
              <div className="h-7 w-40 bg-gray-200 rounded" />
              <div className="h-10 w-24 bg-gray-200 rounded" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i}>
                  <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
                  <div className="h-10 w-full bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
export default ProfileLoader;

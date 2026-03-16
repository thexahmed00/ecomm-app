export default function AdminLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 bg-gray-800 rounded animate-pulse" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-[#0F0F0F] border border-gray-800 rounded-lg p-6 animate-pulse">
            <div className="h-4 w-24 bg-gray-700 rounded mb-4" />
            <div className="h-8 w-16 bg-gray-700 rounded" />
          </div>
        ))}
      </div>

      <div className="h-96 bg-[#0F0F0F] border border-gray-800 rounded-lg animate-pulse" />
    </div>
  );
}
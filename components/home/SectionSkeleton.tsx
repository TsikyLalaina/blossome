export function SectionSkeleton() {
  return (
    <div className="py-20 md:py-28" aria-busy="true" aria-label="Chargement...">
      <div className="container mx-auto px-4 md:px-6">
        {/* Title skeleton */}
        <div className="flex flex-col items-center gap-4 mb-14">
          <div className="h-4 w-24 bg-blossome-taupe/30 rounded animate-pulse" />
          <div className="h-8 w-64 bg-blossome-taupe/40 rounded animate-pulse" />
          <div className="h-4 w-80 bg-blossome-taupe/20 rounded animate-pulse" />
        </div>

        {/* Cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-8 shadow-sm border border-blossome-taupe/20 animate-pulse"
            >
              <div className="w-16 h-16 rounded-full bg-blossome-taupe/20 mx-auto mb-5" />
              <div className="h-5 w-24 bg-blossome-taupe/30 rounded mx-auto mb-3" />
              <div className="h-3 w-full bg-blossome-taupe/15 rounded mb-2" />
              <div className="h-3 w-2/3 bg-blossome-taupe/15 rounded mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ProjectCardsSkeleton() {
  const count = Array.from({ length: 6 })

  return (

    <div className="animate-pulse grid grid-cols-[repeat(auto-fit,218px)] gap-6 p-6 bg-[var(--bg-white)] 
      border-2 rounded-lg items-center">
      {count.map(() => {
        return (
          <div className="p-2 bg-[var(--bg-white)] rounded-md border-[1px]">
            <div className="w-[200px] h-auto bg-[var(--skeleton-gray)] aspect-[16/9] flex rounded-sm"></div>

            <div className="my-1">
              <div className="rounded-sm h-4 bg-[var(--skeleton-gray)]"></div>
              <div className="rounded-sm h-3 bg-[var(--skeleton-gray)]"></div>
            </div>

          </div>
        )
      })}
    </div>
  )
}
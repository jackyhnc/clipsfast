
export default function Loading() {
  const count = Array.from({ length: 6 }, (_, i) => i + 1)

  return (
    <div className="bg-[var(--bg-white)] min-h-lvh py-20">
      <div className="space-y-6">
        <div className="flex gap-3 items-center">
          <div className="w-[250px] bg-[var(--skeleton-gray)] h-6 rounded-lg animate-pulse"></div>
        </div>

        <div className="">
          <div className="animate-pulse grid grid-cols-[repeat(auto-fit,218px)] gap-6 p-6 bg-[var(--bg-white)] 
            border-2 rounded-lg items-center">
            {count.map((c) => {
              return (
                <div className="p-2 bg-[var(--bg-white)] rounded-md border-[1px]" key={c}>
                  <div className="w-[200px] h-auto bg-[var(--skeleton-gray)] aspect-[16/9] flex rounded-sm"></div>

                  <div className="my-1">
                    <div className="rounded-sm h-4 bg-[var(--skeleton-gray)]"></div>
                    <div className="rounded-sm h-3 bg-[var(--skeleton-gray)]"></div>
                  </div>

                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
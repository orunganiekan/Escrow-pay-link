export default function ProductPageLoading() {
  return (
    <div className="min-h-screen bg-[#FFFFFF] md:bg-[#F8F6F1] flex flex-col">
      <header className="w-full border-b border-[#E5E5E5] bg-[#FFFFFF]">
        <div className="max-w-[460px] lg:max-w-[1000px] mx-auto px-4 lg:px-8 h-14 lg:h-16 flex items-center justify-between">
          <div className="h-4 w-24 rounded bg-[#F2F0EB] animate-pulse" />
          <div className="h-6 w-24 rounded-full bg-[#F8F6F1] animate-pulse" />
        </div>
      </header>

      <main className="flex-1 w-full max-w-[460px] lg:max-w-[1000px] mx-auto px-4 lg:px-8 py-6 lg:py-10 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
          <div className="lg:col-span-6 bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl overflow-hidden">
            <div className="aspect-[4/3] w-full bg-[#F8F6F1]" />
            <div className="p-6 space-y-3">
              <div className="h-6 w-2/3 rounded bg-[#F2F0EB]" />
              <div className="h-8 w-32 rounded bg-[#F2F0EB]" />
              <div className="pt-4 border-t border-[#E5E5E5] space-y-2">
                <div className="h-4 w-full rounded bg-[#F8F6F1]" />
                <div className="h-4 w-3/4 rounded bg-[#F8F6F1]" />
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl p-6 space-y-4">
            <div className="h-5 w-48 rounded bg-[#F2F0EB]" />
            <div className="h-11 w-full rounded-xl bg-[#F8F6F1]" />
            <div className="h-11 w-full rounded-xl bg-[#F8F6F1]" />
            <div className="h-11 w-full rounded-xl bg-[#F8F6F1]" />
            <div className="h-11 w-full rounded-xl bg-[#F8F6F1]" />
            <div className="h-12 w-full rounded-full bg-[#F2F0EB]" />
          </div>
        </div>
      </main>
    </div>
  );
}

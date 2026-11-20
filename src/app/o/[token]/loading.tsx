export default function BuyerOrderLoading() {
  return (
    <div className="min-h-screen bg-[#FFFFFF] md:bg-[#F8F6F1] flex flex-col">
      <header className="w-full border-b border-[#E5E5E5] bg-[#FFFFFF]">
        <div className="max-w-[460px] mx-auto px-4 h-14 flex items-center justify-between">
          <div className="h-4 w-24 rounded bg-[#F2F0EB] animate-pulse" />
          <div className="h-8 w-28 rounded-full bg-[#F8F6F1] animate-pulse" />
        </div>
      </header>

      <main className="flex-1 w-full max-w-[460px] mx-auto px-4 py-6 md:py-10 animate-pulse">
        <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl overflow-hidden">
          <div className="bg-[#F8F6F1] p-6 space-y-3 border-b border-[#E5E5E5]">
            <div className="flex justify-between">
              <div className="h-3 w-24 rounded bg-[#E8E4DA]" />
              <div className="h-5 w-28 rounded-full bg-[#E8E4DA]" />
            </div>
            <div className="h-7 w-3/4 rounded bg-[#E8E4DA]" />
            <div className="h-1 w-full rounded-full bg-[#E5E5E5]" />
          </div>
          <div className="p-6 space-y-3">
            <div className="h-12 w-48 mx-auto rounded-lg bg-[#F8F6F1]" />
            <div className="h-4 w-64 mx-auto rounded bg-[#F2F0EB]" />
          </div>
        </div>
      </main>
    </div>
  );
}

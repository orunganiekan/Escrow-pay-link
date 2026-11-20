export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-7 w-36 rounded-lg bg-[#F2F0EB]" />

      <div className="bg-[#F8F6F1] border border-[#ECE8DF] rounded-xl p-6 sm:p-7 space-y-5">
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-10">
          <div className="space-y-2">
            <div className="h-3 w-28 rounded bg-[#E8E4DA]" />
            <div className="h-9 w-36 rounded-lg bg-[#E8E4DA]" />
          </div>
          <div className="space-y-2 sm:pl-10 sm:border-l sm:border-[#E6E1D6]">
            <div className="h-3 w-20 rounded bg-[#E8E4DA]" />
            <div className="h-9 w-28 rounded-lg bg-[#E8E4DA]" />
          </div>
        </div>
        <div className="h-4 w-56 rounded bg-[#E8E4DA]" />
        <div className="h-10 w-36 rounded-full bg-[#FFFFFF] border border-[#E5E5E5]" />
      </div>

      <div className="border border-[#E5E5E5] rounded-xl p-6 space-y-4">
        <div className="h-5 w-32 rounded bg-[#F2F0EB]" />
        <div className="space-y-3 pt-2 border-t border-[#E5E5E5]">
          <div className="h-12 w-full rounded-lg bg-[#F8F6F1]" />
          <div className="h-12 w-full rounded-lg bg-[#F8F6F1]" />
          <div className="h-12 w-full rounded-lg bg-[#F8F6F1]" />
        </div>
      </div>
    </div>
  );
}

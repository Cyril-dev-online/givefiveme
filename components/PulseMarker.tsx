"use client"

type Props = {
  active?: boolean
}

export default function PulseMarker({ active = false }: Props) {
  return (
    <div className="relative h-5 w-5">
      {active && (
        <>
          <span className="absolute inset-0 rounded-full bg-indigo-400 opacity-70 animate-ping" />
          <span className="absolute inset-[-6px] rounded-full border border-indigo-300/70" />
        </>
      )}
      <span className="absolute inset-[3px] rounded-full border border-white bg-indigo-500 shadow-lg" />
    </div>
  )
}
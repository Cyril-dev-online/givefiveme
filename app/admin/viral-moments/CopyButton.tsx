"use client"

export function CopyButton({ text }: { text: string }) {
  return (
    <button
      type="button"
      onClick={() => navigator.clipboard.writeText(text)}
      className="mt-3 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:opacity-90"
    >
      Copy script
    </button>
  )
}
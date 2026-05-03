"use client"

import { useEffect, useState } from "react"

const steps = [
  "Updating global map...",
  "Recomputing country rankings...",
  "Checking top 5 changes...",
  "Detecting live battles...",
]

export default function FakeLiveProcessing() {
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) return prev + 1
        return prev
      })
    }, 600)

    return () => clearInterval(interval)
  }, [])

  return (
    <ul className="mt-6 space-y-2 text-sm text-white/60">
      {steps.map((step, index) => (
        <li
          key={index}
          className={`transition-all ${
            index <= currentStep ? "opacity-100" : "opacity-30"
          }`}
        >
          {index < currentStep ? "✓ " : index === currentStep ? "→ " : "• "}
          {step}
        </li>
      ))}
    </ul>
  )
}
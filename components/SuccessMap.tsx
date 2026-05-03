"use client"

import Map, { Marker } from "react-map-gl"

type SuccessMapProps = {
  latitude: number
  longitude: number
  showPulse: boolean
}

export default function SuccessMap({
  latitude,
  longitude,
  showPulse,
}: SuccessMapProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10">
      <Map
        initialViewState={{
          longitude,
          latitude,
          zoom: 3,
        }}
        style={{ width: "100%", height: "320px" }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      >
        <Marker latitude={latitude} longitude={longitude} anchor="center">
          <div className="relative flex items-center justify-center">
            {showPulse && (
              <div className="absolute h-10 w-10 animate-ping rounded-full bg-indigo-500/30" />
            )}
            <div className="h-5 w-5 rounded-full bg-indigo-500 shadow-lg" />
          </div>
        </Marker>
      </Map>
    </div>
  )
}
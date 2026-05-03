"use client"

import Map, { Marker } from "react-map-gl"
import "mapbox-gl/dist/mapbox-gl.css"

export default function WorldMap({ orders }: any) {

  return (
    <div style={{ width: "100%", height: 500, marginTop: 40 }}>

      <Map
        initialViewState={{
          longitude: 0,
          latitude: 20,
          zoom: 1.4
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      >

        {orders.map((o:any, i:number) => {

          if (!o.lat || !o.lng) return null

          return (
            <Marker
              key={i}
              longitude={o.lng}
              latitude={o.lat}
            >
              <div style={{
                width:10,
                height:10,
                borderRadius:10,
                background:"red"
              }} />
            </Marker>
          )
        })}

      </Map>

    </div>
  )
}
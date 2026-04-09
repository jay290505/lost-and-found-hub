"use client";

export default function MapPage() {
  const mapUrl = "https://www.unirank.org/in/uni/atmiya-university/map/";

  return (
    <div className="flex flex-col gap-8 h-[calc(100vh-10rem)]">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Campus Map
        </h1>
        <p className="text-muted-foreground">
          An interactive map of the university campus.
        </p>
      </div>
      <div className="relative w-full h-full overflow-hidden rounded-lg border shadow-lg">
        <iframe
          src={mapUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen={false}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Atmiya University Map"
        ></iframe>
      </div>
    </div>
  );
}

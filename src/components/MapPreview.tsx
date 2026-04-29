export function MapPreview() {
  return (
    <section id="video-tour" className="bg-neutral-100 py-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-bold uppercase text-brand-red">Thailand Video</p>
          <h2 className="mt-3 text-3xl font-black text-brand-dark sm:text-4xl">
            Why move to Thailand?
          </h2>
        </div>

        <div className="mt-8 overflow-hidden border border-brand-line bg-black shadow-[0_20px_55px_rgba(15,23,42,0.18)]">
          <div className="relative aspect-video w-full">
            <iframe
              className="absolute inset-0 h-full w-full"
              src="https://www.youtube.com/embed/rV3_nmYtcRc"
              title="Why move to Thailand?"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              sandbox="allow-scripts allow-same-origin allow-presentation"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </section>
  );
}

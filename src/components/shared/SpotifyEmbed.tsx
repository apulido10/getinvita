'use client';

interface Props {
  trackId: string;
}

export default function SpotifyEmbed({ trackId }: Props) {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100vw-2rem)] max-w-sm">
      <iframe
        src={`https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`}
        width="100%"
        height="152"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        className="rounded-xl shadow-2xl"
        style={{ border: 'none' }}
      />
    </div>
  );
}

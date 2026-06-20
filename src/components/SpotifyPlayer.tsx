export default function SpotifyPlayer({ playlistUrl }: { playlistUrl: string }) {
  const getEmbedUrl = (url: string) => {
    try {
      const id = url.split('/').pop()?.split('?')[0];
      return `https://open.spotify.com/embed/playlist/${id}?utm_source=generator&theme=0`;
    } catch {
      return "";
    }
  };

  return (
    <iframe
      src={getEmbedUrl(playlistUrl)}
      width="100%"
      height="152"
      frameBorder="0"
      allow="encrypted-media; picture-in-picture"
      sandbox="allow-scripts allow-same-origin allow-forms"
      loading="lazy"
      className="rounded-xl"
    />
  );
}

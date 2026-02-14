interface Props {
  address: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function AddressLink({ address, className, style }: Props) {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  return (
    <a
      href={mapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      style={{ ...style, textDecoration: 'underline', textUnderlineOffset: '2px' }}
    >
      {address}
    </a>
  );
}

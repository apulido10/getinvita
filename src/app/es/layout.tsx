import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  other: {
    'content-language': 'es-US',
  },
};

export default function SpanishLayout({ children }: { children: ReactNode }) {
  return <div lang="es">{children}</div>;
}

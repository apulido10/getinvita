import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  return (
    <nav className="absolute top-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 h-20 flex items-center justify-between">
        <Link href="/" className="relative h-10 w-[140px] sm:w-[160px] rounded-lg overflow-hidden bg-white/90 backdrop-blur-sm px-2">
          <Image
            src="/getinvitalogo.png"
            alt="GetInvita"
            fill
            className="object-contain"
            priority
          />
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="px-3 sm:px-4 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/login?redirect=/order"
            className="rounded-full bg-white px-4 sm:px-5 py-2 text-sm font-semibold text-purple-900 hover:bg-purple-50 transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
}

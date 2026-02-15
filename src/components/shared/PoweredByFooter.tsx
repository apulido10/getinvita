import { ThemeColors } from '@/types';

export default function PoweredByFooter({ colors }: { colors: ThemeColors }) {
  return (
    <footer
      className="w-full py-6 text-center"
      style={{ backgroundColor: colors.background }}
    >
      <a
        href="https://getinvita.com"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block text-xs tracking-wide opacity-40 transition-opacity duration-300 hover:opacity-70"
        style={{ color: colors.textSecondary }}
      >
        Create your own invitation at{' '}
        <span className="font-medium" style={{ color: colors.accent }}>
          GetInvita.com
        </span>
      </a>
    </footer>
  );
}

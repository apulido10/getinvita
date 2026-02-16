import { ThemeColors } from '@/types';
import { Lang, t } from '@/lib/translations';

export default function PoweredByFooter({ colors, lang = 'en' }: { colors: ThemeColors; lang?: Lang }) {
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
        {t('footer.createYourOwn', lang)}{' '}
        <span className="font-medium" style={{ color: colors.accent }}>
          GetInvita.com
        </span>
      </a>
    </footer>
  );
}

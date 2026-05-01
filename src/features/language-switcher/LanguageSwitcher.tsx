import { useTranslation } from "react-i18next";

import { Button } from "../../shared/ui/Button";

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const currentLanguage = i18n.language;

  return (
    <div aria-label={t("language.label")} className="flex rounded-md border border-line bg-white p-1">
      {(["uk", "en"] as const).map((language) => (
        <Button
          aria-pressed={currentLanguage === language}
          className="min-h-8 px-2 py-1 text-xs"
          key={language}
          onClick={() => void i18n.changeLanguage(language)}
          type="button"
          variant={currentLanguage === language ? "primary" : "ghost"}
        >
          {t(`language.${language}`)}
        </Button>
      ))}
    </div>
  );
}

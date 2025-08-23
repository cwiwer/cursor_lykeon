import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { updateLanguage } from "@/services/profile";

const languages = [
  { code: "pt", flag: "🇧🇷", name: "Português (BR)" },
  { code: "en", flag: "🇺🇸", name: "English (US)" },
  { code: "fr", flag: "🇫🇷", name: "Français (CA)" },
];

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  const changeLanguage = async (lng: string) => {
    i18n.changeLanguage(lng);
    try {
      await updateLanguage(lng as "pt" | "en" | "fr");
    } catch (error) {
      console.error("Error updating language preference:", error);
    }
  };

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{currentLanguage.flag}</span>
          <span className="hidden md:inline">{currentLanguage.code.toUpperCase()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            className="gap-2"
          >
            <span>{language.flag}</span>
            <span>{t(language.name.toLowerCase().replace(/\s/g, ''))}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
export const getLogoUrl = (filename: string | null): string => {
    return filename ? `/images/team-logos/${filename}` : "/placeholder.svg";
  };
  
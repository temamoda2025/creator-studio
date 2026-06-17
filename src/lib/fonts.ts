export const FONT_CATEGORIES = [
  {
    label: "Luxury",
    fonts: [
      { family: "Playfair Display",   label: "Playfair Display"   },
      { family: "Cormorant Garamond", label: "Cormorant Garamond" },
      { family: "Libre Baskerville",  label: "Libre Baskerville"  },
    ],
  },
  {
    label: "Modern",
    fonts: [
      { family: "Montserrat", label: "Montserrat" },
      { family: "Inter",      label: "Inter"      },
      { family: "Raleway",    label: "Raleway"    },
    ],
  },
  {
    label: "Bold",
    fonts: [
      { family: "Oswald",     label: "Oswald"     },
      { family: "Anton",      label: "Anton"      },
      { family: "Bebas Neue", label: "Bebas Neue" },
    ],
  },
  {
    label: "Elegant",
    fonts: [
      { family: "Lato",         label: "Lato"         },
      { family: "Josefin Sans", label: "Josefin Sans" },
      { family: "Nunito",       label: "Nunito"       },
    ],
  },
  {
    label: "Casual",
    fonts: [
      { family: "Poppins",   label: "Poppins"   },
      { family: "Quicksand", label: "Quicksand" },
      { family: "Pacifico",  label: "Pacifico"  },
    ],
  },
] as const;

export type FontFamily = (typeof FONT_CATEGORIES)[number]["fonts"][number]["family"];

export const ALL_FONTS: Array<{ family: string; label: string }> =
  FONT_CATEGORIES.flatMap((c) => [...c.fonts]);

export const DEFAULT_FONT: FontFamily = "Inter";

export const GOOGLE_FONTS_HREF =
  "https://fonts.googleapis.com/css2?" +
  "family=Anton&" +
  "family=Bebas+Neue&" +
  "family=Cormorant+Garamond:wght@300;400;500;600;700&" +
  "family=Inter:wght@300;400;500;600;700&" +
  "family=Josefin+Sans:wght@300;400;500;600;700&" +
  "family=Lato:wght@300;400;700&" +
  "family=Libre+Baskerville:wght@400;700&" +
  "family=Montserrat:wght@300;400;500;600;700&" +
  "family=Nunito:wght@300;400;500;600;700&" +
  "family=Oswald:wght@300;400;500;600;700&" +
  "family=Pacifico&" +
  "family=Playfair+Display:wght@300;400;500;600;700&" +
  "family=Poppins:wght@300;400;500;600;700&" +
  "family=Quicksand:wght@300;400;500;600;700&" +
  "family=Raleway:wght@300;400;500;600;700&" +
  "display=swap";

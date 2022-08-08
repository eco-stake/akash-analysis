import React, { useEffect, useState } from "react";
import { darken, lighten, PaletteMode } from "@mui/material";
import { createTheme, ThemeProvider, ThemeOptions } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { customColors } from "@src/utils/colors";
import { grey } from "@mui/material/colors";
import { useDarkMode } from "next-dark-mode";
import { MediaQueryProvider } from "../MediaQueryProvider";

type ContextType = {
  mode: string;
  toggleMode: () => void;
};

const CustomThemeProviderContext = React.createContext<ContextType>({ mode: "", toggleMode: null });

const getDesignTokens = (mode: PaletteMode): ThemeOptions => ({
  palette: {
    mode,
    ...(mode === "light"
      ? {
          // LIGHT
          primary: {
            main: customColors.dark
          },
          secondary: {
            main: customColors.main
          },
          background: {
            default: customColors.lightBg
          }
        }
      : {
          // DARK
          primary: {
            main: customColors.dark
          },
          secondary: {
            main: customColors.main
          },
          background: {
            default: customColors.dark,
            paper: customColors.darkLight
          },
          text: {
            primary: grey[200]
          }
        })
  },
  typography: {
    fontFamily: ["Inter", "sans-serif"].join(",")
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536
    }
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          WebkitFontSmoothing: "auto",
          height: "100%",
          width: "100%"
        },
        body: {
          height: "100%",
          width: "100%",
          overflowY: "auto !important",
          padding: "0 !important",
          "&::-webkit-scrollbar": {
            width: "10px"
          },
          "&::-webkit-scrollbar-track": {
            background: mode === "dark" ? customColors.dark : customColors.white
          },
          "&::-webkit-scrollbar-thumb": {
            width: "5px",
            backgroundColor: mode === "dark" ? customColors.darkLight : grey[500],
            borderRadius: "5px"
          }
        },
        "*": {
          transition: "background-color .2s ease"
        },
        ul: {
          paddingLeft: "2rem"
        },
        // Nextjs root div
        "#__next": {
          height: "100%"
        },
        // Page loading styling
        "#nprogress .bar": {
          background: `${customColors.main} !important`
        },
        "#nprogress .peg": {
          boxShadow: `0 0 10px ${customColors.main}, 0 0 5px ${customColors.main}`
        },
        "#nprogress .spinner-icon": {
          borderTopColor: `${customColors.main} !important`,
          borderLeftColor: `${customColors.main} !important`
        },
        a: {
          textDecoration: "none",
          color: customColors.link
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          transition: "background-color .2s ease, box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
          boxShadow: "none"
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        text: {
          color: mode === "dark" ? customColors.white : customColors.dark
        },
        outlinedSecondary: {
          color: mode === "dark" ? customColors.white : customColors.dark,
          borderWidth: "2px",
          "&:hover": {
            borderWidth: "2px"
          }
        }
      }
    }
  }
});

const darkTheme = createTheme(getDesignTokens("dark"));
const lightTheme = createTheme(getDesignTokens("light"));

export const CustomThemeProvider = ({ children }) => {
  const [isMounted, setIsMounted] = useState(false);
  const { darkModeActive, switchToDarkMode, switchToLightMode } = useDarkMode();
  const mode = darkModeActive ? "dark" : "light";

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleMode = () => {
    if (darkModeActive) {
      switchToLightMode();
    } else {
      switchToDarkMode();
    }
  };

  // Update the theme only if the mode changes
  const theme = React.useMemo(() => (darkModeActive ? darkTheme : lightTheme), [darkModeActive]);

  return (
    <CustomThemeProviderContext.Provider value={{ mode, toggleMode }}>
      <ThemeProvider theme={theme}>
        <MediaQueryProvider>
          <CssBaseline enableColorScheme />
          {isMounted ? children : <div style={{ visibility: "hidden" }}>{children}</div>}
        </MediaQueryProvider>
      </ThemeProvider>
    </CustomThemeProviderContext.Provider>
  );
};

export const useColorMode = () => {
  return { ...React.useContext(CustomThemeProviderContext) };
};

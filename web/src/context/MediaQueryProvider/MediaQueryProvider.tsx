import { useMediaQuery } from "@mui/material";
import React, { createContext, useContext, useMemo } from "react";
// import { useMediaQuery } from "./useMediaQuery";

const MediaQueryContext = createContext(null);

const mediaQueries = {
  phone: "(max-width: 480px)",
  mobile: "(max-width: 767px)",
  small: "(max-width: 991px)",
  prefersReducedMotion: "(prefers-reduced-motion: reduce)"
};

export function MediaQueryProvider({ children }) {
  const phoneView = useMediaQuery(mediaQueries.phone);
  const mobileView = useMediaQuery(mediaQueries.mobile);
  const smallScreen = useMediaQuery(mediaQueries.small);
  const prefersReducedMotion = useMediaQuery(mediaQueries.prefersReducedMotion);
  const value = useMemo(() => ({ mobileView, prefersReducedMotion, smallScreen, phoneView }), [mobileView, prefersReducedMotion, smallScreen, phoneView]);

  return <MediaQueryContext.Provider value={value}>{children}</MediaQueryContext.Provider>;
}

export function useMediaQueryContext() {
  return useContext(MediaQueryContext);
}

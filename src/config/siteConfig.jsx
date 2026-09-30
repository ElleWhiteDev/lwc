import { createContext, useContext, useState, useEffect, useCallback } from "react";

// Default fallback configuration
const DEFAULT_CONFIG = {
  siteName: "A Life Worth Celebrating, Inc.",
  siteTagline: "Creating inclusive spaces for everyone",
  contactEmail: "info@alwcwin.org",
  facebookUrl: "https://www.facebook.com/profile.php?id=61576987598719",
  instagramUrl: "",
  xUrl: "",
  tiktokUrl: "",
  donateUrl: "https://www.zeffy.com/en-US/ticketing/a-life-worth-celebrating-incs-shop",
  orgName: "A Life Worth Celebrating, Inc.",
  logoUrl: "",
};

const SiteConfigContext = createContext(DEFAULT_CONFIG);
const RefreshSiteConfigContext = createContext(() => {});

export const SiteConfigProvider = ({ children }) => {
  const [config, setConfig] = useState(DEFAULT_CONFIG);

  const refresh = useCallback(() => {
    fetch("/api/content/siteConfig")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch site config");
        return res.json();
      })
      .then((data) => {
        if (data.data) {
          setConfig({ ...DEFAULT_CONFIG, ...data.data });
        }
      })
      .catch((err) => {
        console.error("Error loading site config:", err);
        // Keep using DEFAULT_CONFIG on error
      });
  }, []);

  useEffect(refresh, [refresh]);

  return (
    <RefreshSiteConfigContext.Provider value={refresh}>
      <SiteConfigContext.Provider value={config}>
        {children}
      </SiteConfigContext.Provider>
    </RefreshSiteConfigContext.Provider>
  );
};

// Re-fetch site config after an admin save so the change shows without a page reload
export const useRefreshSiteConfig = () => useContext(RefreshSiteConfigContext);

export const useSiteConfig = () => {
  return useContext(SiteConfigContext);
};

// Export default config for backward compatibility
export const SITE_CONFIG = DEFAULT_CONFIG;
export default SITE_CONFIG;

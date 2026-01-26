import { createContext, useContext, useState, useEffect } from "react";

// Default fallback configuration
const DEFAULT_CONFIG = {
  siteName: "A Life Worth Celebrating, Inc.",
  siteTagline: "Creating inclusive spaces for everyone",
  contactEmail: "alifeworthcelebratinginc@gmail.com",
  facebookUrl: "https://www.facebook.com/profile.php?id=61576987598719",
  instagramUrl: "",
  twitterUrl: "",
  donateUrl: "https://www.zeffy.com/en-US/ticketing/a-life-worth-celebrating-incs-shop",
  orgName: "A Life Worth Celebrating, Inc.",
};

const SiteConfigContext = createContext(DEFAULT_CONFIG);

export const SiteConfigProvider = ({ children }) => {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/content/siteConfig")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch site config");
        return res.json();
      })
      .then((data) => {
        if (data.data) {
          setConfig({ ...DEFAULT_CONFIG, ...data.data });
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading site config:", err);
        setError(err);
        setLoading(false);
        // Keep using DEFAULT_CONFIG on error
      });
  }, []);

  return (
    <SiteConfigContext.Provider value={config}>
      {children}
    </SiteConfigContext.Provider>
  );
};

export const useSiteConfig = () => {
  return useContext(SiteConfigContext);
};

// Export default config for backward compatibility
export const SITE_CONFIG = DEFAULT_CONFIG;
export default SITE_CONFIG;

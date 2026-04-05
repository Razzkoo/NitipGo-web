import { createContext, useContext, useEffect, useState } from "react";
import api from "@/lib/api";

type AppSettings = {
  appNameFirst: string;
  appNameLast: string;
  maintenanceMode: boolean;
  setAppName: (first: string, last: string) => void;
};

const AppSettingsContext = createContext<AppSettings | null>(null);

export const AppSettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [appNameFirst, setFirst] = useState("Nitip");
  const [appNameLast, setLast] = useState("Go");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const setAppName = (first: string, last: string) => {
    setFirst(first);
    setLast(last);
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get("/public/settings");

        setFirst(res.data.appNameFirst);
        setLast(res.data.appNameLast);
        setMaintenanceMode(res.data.maintenanceMode);
      } catch (err) {
        console.error("Gagal load app settings", err);
      }
    };

    fetchSettings();
  }, []);

  useEffect(() => {
      const fullName = `${appNameFirst} ${appNameLast}`;
      
      const titleEl = document.getElementById("app-title");
      if (titleEl) titleEl.textContent = fullName;
      document.title = fullName;

      const ogTitle = document.getElementById("meta-og-title");
      if (ogTitle) ogTitle.setAttribute("content", fullName);
    }, [appNameFirst, appNameLast]);

    return (
      <AppSettingsContext.Provider value={{ appNameFirst, appNameLast, maintenanceMode, setAppName }}>
        {children}
      </AppSettingsContext.Provider>
    );
  };

export const useAppSettings = () => {
  const context = useContext(AppSettingsContext);
  if (!context) throw new Error("useAppSettings must be used inside provider");
  return context;
};
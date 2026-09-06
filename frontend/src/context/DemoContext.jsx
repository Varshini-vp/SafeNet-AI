import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { aiAPI, alertAPI, analyticsAPI } from '../services/api';
import { soundService } from '../services/soundService';

const DemoContext = createContext(null);

export const DemoProvider = ({ children }) => {
  const [demoMode, setDemoMode] = useState(true); // Default active for hackathon judges!
  const [liveBannerAlert, setLiveBannerAlert] = useState(null);
  const [activeAlertsCount, setActiveAlertsCount] = useState(4);
  const [simulationTick, setSimulationTick] = useState(0);
  const [metrics, setMetrics] = useState({
    camerasConnected: "10/10",
    vehiclesDetected: 148,
    activeHighRiskAlerts: 4,
    currentTrafficDensity: 72,
    aiEngineStatus: "ACTIVE",
    systemStatus: "ONLINE"
  });

  const timerRef = useRef(null);

  // Poll overview metrics periodically
  const refreshMetrics = async () => {
    try {
      const res = await analyticsAPI.getOverview();
      if (res.data.success) {
        setMetrics(res.data.metrics);
        setActiveAlertsCount(res.data.metrics.totalActiveAlerts);
      }
    } catch (err) {
      // Backend might be offline, fallback locally
    }
  };

  useEffect(() => {
    refreshMetrics();
  }, []);

  // Demo simulation timer
  useEffect(() => {
    if (!demoMode) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(async () => {
      setSimulationTick((prev) => prev + 1);

      // Fluctuating realistic command center numbers
      setMetrics((prev) => ({
        ...prev,
        vehiclesDetected: prev.vehiclesDetected + Math.floor(Math.random() * 3) - 1,
        currentTrafficDensity: Math.min(96, Math.max(45, prev.currentTrafficDensity + (Math.random() > 0.5 ? 1 : -1)))
      }));

      // Every 30 seconds or randomly, trigger minor simulated telemetry
      if (Math.random() < 0.15) {
        try {
          const res = await alertAPI.getActive();
          if (res.data.success && res.data.alerts.length > 0) {
            const latest = res.data.alerts[0];
            if (latest.severity === "HIGH" && (!liveBannerAlert || liveBannerAlert.alertId !== latest.alertId)) {
              setLiveBannerAlert(latest);
              soundService.playAlert(latest.severity);
            }
          }
        } catch (e) {}
      }
    }, 4000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [demoMode, liveBannerAlert]);

  // Explicit Trigger for SIH Demonstrations (e.g. wrong-way vehicle)
  const triggerIncident = async (riskType = "WRONG_WAY_DRIVING", cameraId = "CAM-01") => {
    try {
      const res = await aiAPI.simulateIncident(riskType, cameraId);
      if (res.data.success && res.data.incident.alert) {
        const alert = res.data.incident.alert;
        setLiveBannerAlert(alert);
        soundService.playAlert(alert.severity);
        refreshMetrics();
        setSimulationTick(prev => prev + 1);
        return { success: true, alert };
      }
      return { success: false };
    } catch (err) {
      // Offline simulated fallback incident
      const fallbackAlert = {
        alertId: `ALERT #A${1000 + Math.floor(Math.random() * 900)}`,
        vehicleId: "V-108",
        cameraId: cameraId || "CAM-01",
        location: "Main Junction Outer Ring",
        riskType: riskType,
        severity: "HIGH",
        riskScore: 94,
        explanation: "Wrong-way movement detected against designated lane traffic at high speed",
        status: "ACTIVE",
        timestamp: new Date().toISOString()
      };
      setLiveBannerAlert(fallbackAlert);
      soundService.playAlert("HIGH");
      setMetrics(prev => ({
        ...prev,
        activeHighRiskAlerts: prev.activeHighRiskAlerts + 1,
        totalActiveAlerts: prev.totalActiveAlerts + 1
      }));
      setSimulationTick(prev => prev + 1);
      return { success: true, alert: fallbackAlert };
    }
  };

  const dismissBannerAlert = () => {
    setLiveBannerAlert(null);
  };

  return (
    <DemoContext.Provider value={{
      demoMode,
      setDemoMode,
      liveBannerAlert,
      dismissBannerAlert,
      triggerIncident,
      metrics,
      refreshMetrics,
      activeAlertsCount,
      simulationTick
    }}>
      {children}
    </DemoContext.Provider>
  );
};

export const useDemo = () => useContext(DemoContext);

"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  RunWithPrediction,
  SelectedRunWithPrediction,
} from "@/components/types/Run";

import { useDisclosure } from "@heroui/react";
import RunOverviewModal from "@/components/RunOverview/RunOverviewModal";
import ActivityDiagramModal from "@/components/ActivityDiagram/ActivityDiagramModal";

import PredictionModal from "@/components/PredictionModal/PredictionModal";
import { type Route } from "@/components/RouteTracker/RouteTrackerMap";
import { type SortMode } from "@/components/types/viewMode";

const RouteTrackerMap = dynamic(
  () => import("@/components/RouteTracker/RouteTrackerMap"),
  {
    ssr: false,
    loading: () => <p>Karte wird geladen...</p>,
  }
);

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [buttonHeaderHeight, setButtonHeaderHeight] = useState("80px");
  const [runs, setRuns] = useState<RunWithPrediction[]>([]);
  const [sortMode, setSortMode] = useState<SortMode | null>(null);

  const {
    isOpen: isRunModalOpen,
    onOpen: onRunModalOpen,
    onOpenChange: onRunModalOpenChange,
  } = useDisclosure();

  const {
    isOpen: isStatsModalOpen,
    onOpen: onStatsModalOpen,
    onOpenChange: onStatsModalOpenChange,
  } = useDisclosure();

  const {
    isOpen: isPredictionModalOpen,
    onOpen: onPredictionModalOpen,
    onOpenChange: onPredictionModalOpenChange,
  } = useDisclosure();

  const [prediction, setPrediction] =
    useState<SelectedRunWithPrediction | null>(null);

  useEffect(() => {
    const fetchRuns = async () => {
      try {
        const res = await fetch("/api/athlete/activities/all");
        if (!res.ok) throw new Error("Fehler beim Laden der Aktivitäten");
        const data: RunWithPrediction[] = await res.json();
        setRuns(data);
      } catch (err) {
        console.error("Konnte Lauf-Daten nicht laden:", err);
      }
    };
    fetchRuns();
  }, []);

  const handlePredict = useCallback(
    async (route: Route) => {
      const now = new Date();
      const params = {
        distance: route.distance.toString(),
        elev_high: route.maxElevation.toString(),
        elev_low: route.minElevation.toString(),
        hour: now.getHours().toString(),
        month: (now.getMonth() + 1).toString(),
        weekday: ((now.getDay() + 6) % 7).toString(),
      };
      const queryParams = new URLSearchParams(params);

      try {
        const res = await fetch(
          `/api/predict_run?${queryParams.toString()}`
        );
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.detail || "Fehler bei der Vorhersage-API");
        }
        const data: SelectedRunWithPrediction = await res.json();

        setPrediction(data);
        onPredictionModalOpen();
      } catch (err) {
        console.error("Fehler beim Abrufen der Vorhersage:", err);
        alert((err as Error).message);
      }
    },
    [onPredictionModalOpen]
  );

  useEffect(() => {
    const updateButtonPosition = () => {
      setButtonHeaderHeight("80px");
    };
    updateButtonPosition();
    window.addEventListener("resize", updateButtonPosition);
    return () => window.removeEventListener("resize", updateButtonPosition);
  }, []);

  useEffect(() => setIsClient(true), []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Tab") event.preventDefault();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const memoizedMap = useMemo(() => {
    if (isClient) {
      return (
        <RouteTrackerMap
          onShowRuns={onRunModalOpen}
          onShowStats={onStatsModalOpen}
          onPredict={handlePredict}
        />
      );
    }
    return null;
  }, [isClient, onRunModalOpen, onStatsModalOpen]);

  if (!isClient) return null;

  return (
    <>
      <main className="dark w-screen h-screen p-[1.5vh_1.5vw] bg-[#121212] flex flex-col gap-[1.5vh] text-[#e0e0e0] overflow-hidden">
        <div className="w-[97vw] h-[97vh] flex-1 min-h-0 bg-[#2c3e50] rounded-lg overflow-hidden relative text-[#f0f0f0]">
          {memoizedMap}
        </div>
      </main>

      <RunOverviewModal
        runs={runs}
        isOpen={isRunModalOpen}
        onOpenChange={onRunModalOpenChange}
        sortMode={sortMode}
        onSortModeChange={setSortMode}
      />

      <ActivityDiagramModal
        runs={runs.map((r) => r.run)}
        isOpen={isStatsModalOpen}
        onOpenChange={onStatsModalOpenChange}
      />

      <PredictionModal
        run={prediction}
        isOpen={isPredictionModalOpen}
        onOpenChange={onPredictionModalOpenChange}
      />
    </>
  );
}

"use client";

import React, { useMemo } from "react";
import { RunWithPrediction } from "../types/Run";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";

import {
  Sun,
  Moon,
  CalendarDays,
  Snowflake,
  Leaf,
  Clock,
  Route,
  Gauge,
  Thermometer,
  Wind,
  HeartPulse,
  Heart,
  Sparkles,
  TrendingUp,
  ArrowUpToLine,
} from "lucide-react";

import ActivityFilterButton from "../Buttons/activityFilterButton";
import { SortMode } from "../types/viewMode";

interface RunOverviewModalProps {
  runs: RunWithPrediction[];
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  sortMode: SortMode | null;
  onSortModeChange: (mode: SortMode) => void;
}

const ITEM_HEIGHT = 280;

const formatPace = (metersPerSecond: number): string => {
  if (!metersPerSecond || metersPerSecond <= 0) return "-:--";
  const decimalMinutes = 1000 / 60 / metersPerSecond;
  const minutes = Math.floor(decimalMinutes);
  const seconds = Math.round((decimalMinutes - minutes) * 60);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
};

const formatSekundenZuStundenMinuten = (totalSeconds: number): string => {
  const stunden = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const minuten = String(Math.floor((totalSeconds % 3600) / 60)).padStart(
    2,
    "0"
  );
  return `${stunden}:${minuten}`;
};

const formatSecondsToHHMMSS = (totalSeconds: number): string => {
  const roundedTotalSeconds = Math.round(totalSeconds);
  const hours = String(Math.floor(roundedTotalSeconds / 3600)).padStart(2, "0");
  const minutes = String(
    Math.floor((roundedTotalSeconds % 3600) / 60)
  ).padStart(2, "0");
  const seconds = String(roundedTotalSeconds % 60).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
};

const getDaytimeInfo = (hour: number) => {
  if (hour >= 6 && hour < 12)
    return {
      value: "Morning",
      icon: <Sun size={20} className="text-yellow-400" />,
    };
  if (hour >= 12 && hour < 18)
    return {
      value: "Afternoon",
      icon: <Sun size={20} className="text-yellow-400" />,
    };
  return {
    value: "Evening",
    icon: <Moon size={20} className="text-blue-300" />,
  };
};

const getWeekdayInfo = (weekday: number) => {
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  return {
    value: days[weekday] || "N/A",
    icon: <CalendarDays size={20} className="text-red-400" />,
  };
};

const getSeasonInfo = (month: number) => {
  if (month === 12 || month <= 2)
    return {
      value: "Winter",
      icon: <Snowflake size={20} className="text-cyan-400" />,
    };
  if (month <= 5)
    return {
      value: "Spring",
      icon: <Leaf size={20} className="text-green-400" />,
    };
  if (month <= 8)
    return {
      value: "Summer",
      icon: <Sun size={20} className="text-orange-400" />,
    };
  return { value: "Fall", icon: <Leaf size={20} className="text-amber-600" /> };
};

const WeekdayHourBlock = ({
  runData,
}: {
  runData: RunWithPrediction["run"];
}) => {
  const daytime = getDaytimeInfo(runData.time_hour);
  const weekday = getWeekdayInfo(runData.time_weekday);

  return (
    <div className="flex flex-col p-3 bg-neutral-800 rounded-lg h-full justify-center space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {daytime.icon}
          <span className="text-sm font-bold text-zinc-50">
            {daytime.value}
          </span>
        </div>
        <span className="text-[10px] text-neutral-400 uppercase tracking-wide">
          Daytime
        </span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {weekday.icon}
          <span className="text-sm font-bold text-zinc-50">
            {weekday.value}
          </span>
        </div>
        <span className="text-[10px] text-neutral-400 uppercase tracking-wide">
          Weekday
        </span>
      </div>
    </div>
  );
};

const StatBlock = ({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
}) => (
  <div className="flex flex-col items-center justify-center p-2 bg-neutral-800 rounded-lg h-full">
    {icon}
    <span className="text-sm font-bold text-zinc-50 mt-1">{value}</span>
    <span className="text-[10px] text-neutral-400 uppercase tracking-wide">
      {label}
    </span>
  </div>
);

const RunOverviewModal: React.FC<RunOverviewModalProps> = ({
  runs,
  isOpen,
  onOpenChange,
  sortMode,
  onSortModeChange,
}) => {
  const entries = Object.entries(runs);

  const sortedEntries = useMemo(() => {
    if (!entries || entries.length === 0) return [];
    if (!sortMode) return entries;

    const dir = sortMode.direction === "asc" ? 1 : -1;
    const copy = [...entries];

    return copy.sort((a: any, b: any) => {
      switch (sortMode.field) {
        case "distance":
          return dir * (a[1].run.distance - b[1].run.distance);
        case "time":
          return dir * (a[1].run.moving_time - b[1].run.moving_time);
        case "pace":
          return dir * (b[1].run.average_pace - a[1].run.average_pace);
        case "prediction":
          const diffA = Math.abs(
            a[1].run.moving_time - a[1].prediction.prediction
          );
          const diffB = Math.abs(
            b[1].run.moving_time - b[1].prediction.prediction
          );
          return dir * (diffA - diffB);
        default:
          return 0;
      }
    });
  }, [entries, sortMode]);

  const { totalDistanceInKm, totalTime } = useMemo(() => {
    const gesamtMeter = runs.reduce((sum, run) => sum + run.run.distance, 0);
    const gesamtSekunden = runs.reduce(
      (sum, run) => sum + run.run.moving_time,
      0
    );
    return {
      totalDistanceInKm: (gesamtMeter / 1000).toFixed(2),
      totalTime: formatSekundenZuStundenMinuten(gesamtSekunden),
    };
  }, [runs]);

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      scrollBehavior="inside"
      classNames={{
        backdrop: "z-[9998]",
        wrapper: "z-[9999]",
        base: "w-[80vw] max-w-[80vw] h-[80vh] max-h-[80vh]",
      }}
      hideCloseButton
      isDismissable={false}
    >
      <ModalContent className="bg-neutral-900 text-neutral-200">
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col items-start gap-1 border-b border-[#9B5DE0] pb-3">
              <div className="flex w-full justify-between items-center">
                <div className="text-xl text-[#9B5DE0]">All Activities</div>
                <ActivityFilterButton
                  selectedMode={sortMode}
                  onModeChange={onSortModeChange}
                />
              </div>
              <div className="text-base text-neutral-300">
                <p>
                  Total Distance:{" "}
                  <span className="text-[#9B5DE0]">{totalDistanceInKm} km</span>{" "}
                  | Total Time:{" "}
                  <span className="text-[#9B5DE0]">{totalTime} h</span>
                </p>
              </div>
            </ModalHeader>

            <ModalBody>
              {runs.length === 0 ? (
                <div className="w-full h-48 flex items-center justify-center text-zinc-50">
                  <p>No stats available</p>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {sortedEntries.map(([key, run]) => {
                    const seasonInfo = getSeasonInfo(run.run.time_month);
                    return (
                      <div
                        key={run.run.id}
                        className="relative flex items-center justify-center"
                        style={{ minHeight: `${ITEM_HEIGHT}px` }}
                      >
                        <div
                          className="bg-neutral-900 border border-[#9B5DE0] shadow-lg relative"
                          style={{
                            width: "100%",
                            height: "100%",
                            borderRadius: "1.5rem",
                          }}
                        >
                          <div className="h-full flex flex-col pt-2 px-6 pb-4">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="text-xl font-bold text-zinc-50">
                                {run.run.name}
                              </h3>
                              <div className="text-right">
                                <p className="text-sm text-neutral-400">
                                  Run ID
                                </p>
                                <p className="font-mono text-lg text-zinc-50">
                                  {String(run.run.id).slice(-3)}
                                </p>
                              </div>
                            </div>

                            {/* Statistics */}
                            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4">
                              <div className="flex flex-col gap-3">
                                <h4 className="font-semibold text-neutral-200 border-b border-neutral-600 pb-1">
                                  Statistics
                                </h4>
                                <div className="grid grid-cols-3 gap-2 mt-1">
                                  <StatBlock
                                    icon={
                                      <Clock
                                        size={20}
                                        className="text-orange-500"
                                      />
                                    }
                                    value={formatSecondsToHHMMSS(
                                      run.run.moving_time
                                    )}
                                    label="time"
                                  />
                                  <StatBlock
                                    icon={
                                      <Route
                                        size={20}
                                        className="text-orange-500"
                                      />
                                    }
                                    value={(run.run.distance / 1000).toFixed(2)}
                                    label="distance in km"
                                  />
                                  <StatBlock
                                    icon={
                                      <Gauge
                                        size={20}
                                        className="text-orange-500"
                                      />
                                    }
                                    value={formatPace(run.run.average_pace)}
                                    label="average speed"
                                  />
                                </div>
                              </div>

                              <div className="flex flex-col gap-3">
                                <h4 className="font-semibold text-neutral-200 border-b border-neutral-600 pb-1">
                                  Time & Temperature
                                </h4>
                                <div className="grid grid-cols-3 gap-2 mt-1">
                                  <WeekdayHourBlock runData={run.run} />
                                  <StatBlock
                                    icon={seasonInfo.icon}
                                    value={seasonInfo.value}
                                    label="season"
                                  />
                                  <StatBlock
                                    icon={
                                      <Thermometer
                                        size={20}
                                        className="text-red-500"
                                      />
                                    }
                                    value={
                                      run.run.temperature != null
                                        ? `${run.run.temperature} °C`
                                        : "N/A"
                                    }
                                    label="temperature"
                                  />
                                </div>
                              </div>

                              <div className="flex flex-col gap-3">
                                <h4 className="font-semibold text-neutral-200 border-b border-neutral-600 pb-1">
                                  Elevation & Wind
                                </h4>
                                <div className="grid grid-cols-3 gap-2 text-center text-xs mt-1">
                                  <StatBlock
                                    icon={
                                      <ArrowUpToLine
                                        size={20}
                                        className="text-blue-400"
                                      />
                                    }
                                    value={`${run.run.elev_high.toFixed(0)} m`}
                                    label="max height"
                                  />
                                  <StatBlock
                                    icon={
                                      <TrendingUp
                                        size={20}
                                        className="text-green-400"
                                      />
                                    }
                                    value={`${run.run.elev_gained.toFixed(0)} m`}
                                    label="gained height"
                                  />
                                  <StatBlock
                                    icon={
                                      <Wind
                                        size={20}
                                        className="text-blue-400"
                                      />
                                    }
                                    value={
                                      run.run.wind_speed != null
                                        ? run.run.wind_speed
                                        : "N/A"
                                    }
                                    label="wind speed"
                                  />
                                </div>
                              </div>

                              <div className="flex flex-col gap-3">
                                <h4 className="font-semibold text-neutral-200 border-b border-neutral-600 pb-1">
                                  Heartrate & Prediction
                                </h4>
                                <div className="grid grid-cols-3 gap-2 mt-1">
                                  <StatBlock
                                    icon={
                                      <HeartPulse
                                        size={20}
                                        className="text-orange-500"
                                      />
                                    }
                                    value={run.run.max_heart_rate}
                                    label="max heartrate"
                                  />
                                  <StatBlock
                                    icon={
                                      <Heart
                                        size={20}
                                        className="text-red-500"
                                      />
                                    }
                                    value={run.run.average_heart_rate}
                                    label="avg heartrate"
                                  />
                                  <StatBlock
                                    icon={
                                      <Sparkles
                                        size={20}
                                        className="text-yellow-500"
                                      />
                                    }
                                    value={formatSecondsToHHMMSS(
                                      run.prediction.prediction
                                    )}
                                    label="prediction"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ModalBody>

            <ModalFooter className="border-t border-neutral-700">
              <Button color="default" onPress={() => onOpenChange(false)}>
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default RunOverviewModal;

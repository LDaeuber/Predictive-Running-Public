"use client";
import React, { useMemo } from "react";
import { SelectedRunWithPrediction } from "../types/Run";
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
  ArrowUpToLine,
  ArrowDownToLine,
  TrendingUp,
  Gauge,
  Sparkles,
  Route,
  Clock,
} from "lucide-react";

interface PredictionModalProps {
  run: SelectedRunWithPrediction | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

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

const LargeStatBlock = ({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
}) => (
  <div className="flex flex-col items-center justify-center p-4 bg-neutral-800 rounded-lg h-full">
    {icon}
    <span className="text-xl font-bold text-zinc-50 mt-2">{value}</span>
    <span className="text-xs text-neutral-400 uppercase tracking-wide">
      {label}
    </span>
  </div>
);

const formatPace = (metersPerSecond: number): string => {
  if (!metersPerSecond || metersPerSecond <= 0) {
    return "-:--";
  }
  const decimalMinutes = 1000 / 60 / metersPerSecond;
  const minutes = Math.floor(decimalMinutes);
  const seconds = Math.round((decimalMinutes - minutes) * 60);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
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

const PredictionModal: React.FC<PredictionModalProps> = ({
  run,
  isOpen,
  onOpenChange,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      className="dark"
      scrollBehavior="inside"
      classNames={{
        backdrop: "z-[9998]",
        wrapper: "z-[9999]",
        base: "w-[50vw] max-w-[50vw] h-[56vh] max-h-[56vh]",
      }}
      hideCloseButton={true}
      isDismissable={false}
    >
      <ModalContent className="bg-neutral-900 text-neutral-200">
        {(onClose) => (
          <>
            <ModalHeader className="flex justify-between flex-column items-center gap-1 border-b border-[#9B5DE0]">
              <div className="text-xl text-[#9B5DE0]">Predicted Run</div>
            </ModalHeader>

            <ModalBody>
              {!run ? (
                <div className="w-full h-48 flex items-center justify-center text-zinc-50">
                  <p>No stats available</p>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  <div
                    className="bg-neutral-900 border border-[#9B5DE0] shadow-lg relative"
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "1.5rem",
                    }}
                  >
                    <div className="h-full flex flex-col pt-2 px-6 pb-4">
                      <div className="flex justify-between items-start mb-2"></div>

                      <div className="flex-1 flex flex-col gap-4">
                        <div className="flex flex-col gap-3">
                          <div className="grid grid-cols-3 gap-2 mt-1">
                            <LargeStatBlock
                              icon={
                                <div className="flex items-center justify-center gap-2">
                                  <Clock
                                    size={32}
                                    className="text-orange-500"
                                  />
                                  <Sparkles
                                    size={32}
                                    className="text-yellow-500"
                                  />
                                </div>
                              }
                              value={formatSecondsToHHMMSS(
                                run.prediction.prediction
                              )}
                              label="predicted time"
                            />
                            <LargeStatBlock
                              icon={
                                <Route size={32} className="text-orange-500" />
                              }
                              value={(run.run.distance / 1000).toFixed(2)}
                              label="distance"
                            />
                            <LargeStatBlock
                              icon={
                                <Gauge size={32} className="text-orange-500" />
                              }
                              value={formatPace(
                                run.run.distance / run.prediction.prediction
                              )}
                              label="average speed"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-3">
                          <div className="grid grid-cols-3 gap-2 text-center text-xs mt-1">
                            <StatBlock
                              icon={
                                <ArrowDownToLine
                                  size={20}
                                  className="text-blue-400"
                                />
                              }
                              value={`${run.run.elev_low.toFixed(0)} m`}
                              label="min height"
                            />
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
                              value={`${(
                                run.run.elev_high - run.run.elev_low
                              ).toFixed(0)} m`}
                              label="gained height"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-3">
                          <div className="grid grid-cols-3 gap-2 text-center mt-1">
                            <StatBlock
                              icon={
                                run.run.time_hour >= 6 &&
                                run.run.time_hour < 18 ? (
                                  <Sun size={20} className="text-yellow-400" />
                                ) : (
                                  <Moon size={20} className="text-blue-300" />
                                )
                              }
                              value={
                                run.run.time_hour >= 6 && run.run.time_hour < 12
                                  ? "morning"
                                  : run.run.time_hour >= 12 &&
                                      run.run.time_hour < 18
                                    ? "afternoon"
                                    : "evening"
                              }
                              label="Daytime"
                            />
                            <StatBlock
                              icon={
                                <CalendarDays
                                  size={20}
                                  className="text-red-400"
                                />
                              }
                              value={
                                [
                                  "Monday",
                                  "Tuesday",
                                  "Wednesday",
                                  "Thursday",
                                  "Friday",
                                  "Saturday",
                                  "Sunday",
                                ][run.run.time_weekday]
                              }
                              label="Weekday"
                            />
                            <StatBlock
                              icon={
                                run.run.time_month === 12 ||
                                run.run.time_month <= 2 ? (
                                  <Snowflake
                                    size={20}
                                    className="text-cyan-400"
                                  />
                                ) : run.run.time_month <= 5 ? (
                                  <Leaf size={20} className="text-green-400" />
                                ) : run.run.time_month <= 8 ? (
                                  <Sun size={20} className="text-orange-400" />
                                ) : (
                                  <Leaf size={20} className="text-amber-600" />
                                )
                              }
                              value={
                                run.run.time_month === 12 ||
                                run.run.time_month <= 2
                                  ? "winter"
                                  : run.run.time_month <= 5
                                    ? "spring"
                                    : run.run.time_month <= 8
                                      ? "summer"
                                      : "fall"
                              }
                              label="season"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </ModalBody>

            <ModalFooter className="border-t border-neutral-700">
              <Button color="default" onPress={onClose}>
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default PredictionModal;

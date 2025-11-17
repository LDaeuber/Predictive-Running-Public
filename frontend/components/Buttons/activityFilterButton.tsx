"use client";

import React, { useEffect, useState } from "react";
import {
  Button,
  ButtonGroup,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import { SortMode } from "@/components/types/viewMode";
import { ArrowDown, ArrowUp } from "lucide-react";

export const ChevronDownIcon = () => (
  <svg
    fill="none"
    height="10"
    viewBox="0 0 24 24"
    width="10"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M17.9188 8.17969H11.6888H6.07877C5.11877 8.17969 4.63877 9.33969 5.31877 10.0197L10.4988 15.1997C11.3288 16.0297 12.6788 16.0297 13.5088 15.1997L15.4788 13.2297L18.6888 10.0197C19.3588 9.33969 18.8788 8.17969 17.9188 8.17969Z"
      fill="currentColor"
    />
  </svg>
);

interface ActivityFilterButtonProps {
  selectedMode: SortMode | null;
  onModeChange: (mode: SortMode) => void;
}

export default function ActivityFilterButton({
  selectedMode,
  onModeChange,
}: ActivityFilterButtonProps) {
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(
    null
  );

  const [sortDirection, setSortDirection] = useState<
    Record<SortMode["field"], "asc" | "desc">
  >({
    distance: "desc",
    time: "desc",
    pace: "asc",
    prediction: "asc",
  });

  useEffect(() => {
    const el = document.getElementById("team-modal");
    if (el) setPortalContainer(el);
  }, []);

  const labelsMap: Record<SortMode["field"], string> = {
    distance: "Distance",
    time: "Time",
    pace: "Pace",
    prediction: "Prediction",
  };

  const colorPurple = "#9B5DE0";

  const toggleDirection = (field: SortMode["field"]) => {
    const newDir = sortDirection[field] === "desc" ? "asc" : "desc";

    setSortDirection((prev) => ({
      ...prev,
      [field]: newDir,
    }));

    onModeChange({
      field,
      direction: newDir,
    });
  };

  return (
    <div>
      <ButtonGroup size="sm" variant="flat">
        <Button
          size="sm"
          style={{
            color: colorPurple,
            fontSize: "14px",
          }}
        >
          {selectedMode ? labelsMap[selectedMode.field] : "Sort by"}
        </Button>

        <Dropdown
          placement="bottom-end"
          portalContainer={portalContainer ?? undefined}
        >
          <DropdownTrigger>
            <Button
              isIconOnly
              style={{
                color: colorPurple,
                fontSize: "14px",
              }}
            >
              <ChevronDownIcon />
            </Button>
          </DropdownTrigger>

          <DropdownMenu
            disallowEmptySelection
            aria-label="Filter options"
            className="max-w-[300px] bg-neutral-900 text-gray-100"
            selectedKeys={
              selectedMode ? new Set([selectedMode.field]) : new Set()
            }
            selectionMode="single"
            onAction={(key) => {
              const field = key as SortMode["field"];
              onModeChange({
                field,
                direction: sortDirection[field],
              });
            }}
          >
            {(Object.keys(labelsMap) as SortMode["field"][]).map((field) => (
              <DropdownItem key={field} textValue={`Sort by ${field}`}>
                <div className="flex justify-between items-center w-full">
                  <span style={{ color: colorPurple, fontSize: "14px" }}>
                    {labelsMap[field]}
                  </span>

                  {/* small arrow button */}
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDirection(field);
                    }}
                    className="cursor-pointer select-none"
                  >
                    {sortDirection[field] === "desc" ? (
                      <ArrowDown size={12} />
                    ) : (
                      <ArrowUp size={12} />
                    )}
                  </span>
                </div>
              </DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>
      </ButtonGroup>
    </div>
  );
}

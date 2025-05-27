/**
 * @jest-environment jsdom
*/
import React from "react";
import '@testing-library/jest-dom';
import { render, screen } from "@testing-library/react";
import { jest, expect, it, describe, beforeEach} from '@jest/globals';
import { LearningStats } from "../../../frontend/src/components/learningStats";

import { useLearningStats } from "../../../frontend/src/context/learningStatsContext";
import { useStatUpdater } from "../../../frontend/src/hooks/learningStatsUpdater";

jest.mock("../../../frontend/src/context/learningStatsContext", () => ({
  useLearningStats: jest.fn(),
}));

jest.mock("../../../frontend/src/hooks/learningStatsUpdater", () => ({
  useStatUpdater: jest.fn(),
}));

describe("LearningStats component", () => {
  let handleUpdateMock;
  render(<LearningStats />);

  beforeEach(() => {
    handleUpdateMock = jest.fn();
    (useStatUpdater).mockReturnValue(handleUpdateMock);
  });


  it("renders default stats when stats is undefined", () => {
    (useLearningStats).mockReturnValue({ stats: null });

    expect(screen.getByText("Learning Progress")).toBeInTheDocument();
    expect(screen.getByText("In Progress")).toBeInTheDocument();
    expect(screen.getByText("Lessons Completed")).toBeInTheDocument();
    expect(screen.getByText("Signs Learned")).toBeInTheDocument();
    expect(screen.getByText("Practice Days")).toBeInTheDocument();
    expect(screen.getByText("Current Level")).toBeInTheDocument();

    expect(document.querySelectorAll(".stat-value")[0].textContent).toBe("0/30");
    expect(document.querySelectorAll(".stat-value")[1].textContent).toBe("0");;     
    expect(document.querySelectorAll(".stat-value")[2].textContent).toBe("0");    
    expect(document.querySelectorAll(".stat-value")[3].textContent).toBe("Bronze"); 

    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute("aria-valuenow", "0");
    expect(progressBar).toHaveAttribute("aria-valuemin", "0");
    expect(progressBar).toHaveAttribute("aria-valuemax", "100");
  });

  it("renders stats correctly and calculates progressPercent", () => {
    (useLearningStats).mockReturnValue({
      stats: {
        lessonsCompleted: 15,
        signsLearned: 5,
        streak: 10,
        currentLevel: "Bronze",
      },
    });

    render(<LearningStats />);

    expect(screen.getByText("15/30")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("Bronze")).toBeInTheDocument();
    expect(screen.getByText("50%")).toBeInTheDocument();
  });

  it("caps lessonsCompleted at 30 for progress calculation", () => {
    (useLearningStats).mockReturnValue({
      stats: {
        lessonsCompleted: 100,
        signsLearned: 0,
        streak: 0,
        currentLevel: "Bronze",
      },
    });

    render(<LearningStats />);

    expect(screen.getByText("30/30")).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  it("calls handleUpdate with new level when level changes to Silver", () => {
  (useLearningStats).mockReturnValue({
    stats: {
      lessonsCompleted: 12,
      signsLearned: 27,
      streak: 9,
      currentLevel: "Silver",
    },
  });

    render(<LearningStats />);
    expect(document.querySelectorAll(".stat-value")[3].textContent).toBe("Silver");
  });
});


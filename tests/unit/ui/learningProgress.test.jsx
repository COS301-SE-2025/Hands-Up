/**
 * @jest-environment jsdom
*/
import React from "react";
import '@testing-library/jest-dom';
import { render, screen } from "@testing-library/react";
import { jest, expect, it, describe, beforeEach} from '@jest/globals';
import { MemoryRouter } from 'react-router-dom';
import { Learn } from "../../../frontend/src/pages/learn";

import { useLearningStats } from "../../../frontend/src/contexts/learningStatsContext";
import { useStatUpdater } from "../../../frontend/src/hooks/learningStatsUpdater";

const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const original = jest.requireActual('react-router-dom');
  return {
    __esModule: true,
    ...original,
    useNavigate: () => mockedNavigate,
  };
});

jest.mock("../../../frontend/src/contexts/learningStatsContext", () => ({
  useLearningStats: jest.fn(),
}));

jest.mock("../../../frontend/src/hooks/learningStatsUpdater", () => ({
  useStatUpdater: jest.fn(),
}));

describe("Learn Page", () => {

  beforeEach(() => {
    useStatUpdater.mockReturnValue(jest.fn());
  });

  it("renders default stats when stats is undefined", () => {
    useLearningStats.mockReturnValue({ stats: null });
    useStatUpdater.mockReturnValue(jest.fn());

    render(
      <MemoryRouter>
        <Learn />
      </MemoryRouter>
    );

    expect(screen.getByText("Progress")).toBeInTheDocument();
    expect(screen.getByText("Lessons Completed")).toBeInTheDocument();
    expect(screen.getByText("Signs Learned")).toBeInTheDocument();

    expect(screen.getByText("0%")).toBeInTheDocument(); 
    expect(screen.getAllByText("0").length).toBeGreaterThanOrEqual(2);
  });

  it("renders stats correctly and calculates progressPercent", async () => {
    (useLearningStats).mockReturnValue({
      stats: {
        lessonsCompleted: 15,
        learnedSigns: 5,
        signsLearned: 5,
        streak: 10,
        currentLevel: "Bronze",
      },
    });

    render(
      <MemoryRouter>
        <Learn />
      </MemoryRouter>
    );

    expect(screen.getByText("Progress")).toBeInTheDocument();
    expect(screen.getByText("Lessons Completed")).toBeInTheDocument();
    expect(screen.getByText("Signs Learned")).toBeInTheDocument();

    expect(screen.getByText("5%")).toBeInTheDocument();
    expect(await screen.findByText("15")).toBeInTheDocument();
    expect(await screen.findByText("5")).toBeInTheDocument();
  });

  it("shows lessons for alphabet when category is clicked", async () => {
    useLearningStats.mockReturnValue({ stats: null }); 

    render(
      <MemoryRouter>
        <Learn />
      </MemoryRouter>
    );

    const alphabetCategory = screen.getByText("The Alphabet");
    expect(alphabetCategory).toBeInTheDocument();

    alphabetCategory.click();

    expect(await screen.findByText("The Alphabet Levels")).toBeInTheDocument();

    const levelTiles = screen.getAllByText((content) => /^[A-Z]$/.test(content));
    expect(levelTiles.length).toBe(26);

    expect(screen.getByRole("button", { name: /back/i })).toBeInTheDocument();
  });

  it("does not allow clicking a locked category", () => {
    useLearningStats.mockReturnValue({ stats: null });

    render(
      <MemoryRouter>
        <Learn />
      </MemoryRouter>
    );

    const lockedCategory = screen.getByText("Objects & Things");
    expect(lockedCategory).toBeInTheDocument();
    lockedCategory.click();

    expect(screen.queryByText("Objects & Things Levels")).not.toBeInTheDocument();
    expect(screen.getByText("The Alphabet")).toBeInTheDocument();
    expect(screen.getByText("Objects & Things")).toBeInTheDocument();
  });

});


/**
 * @jest-environment jsdom
 */
import React from "react";
import '@testing-library/jest-dom';
import { render, screen } from "@testing-library/react";
import { jest, expect, it, describe, beforeEach } from '@jest/globals';
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
    useLocation: () => ({ state: null }),
  };
});

jest.mock("../../../frontend/src/contexts/learningStatsContext", () => ({
  useLearningStats: jest.fn(),
}));

jest.mock("../../../frontend/src/hooks/learningStatsUpdater", () => ({
  useStatUpdater: jest.fn(),
}));

jest.mock('../../../frontend/src/components/learnSidebar', () => ({
  Sidebar: ({ progressPercent, signsLearned, lessonsCompleted, quizzesCompleted }) => (
    <div className="sidebar">
      <div className="sidebar-item active">Learning Map</div>
      <div className="sidebar-summary">
        <div className="summary-item">
          <div className="summary-title">Progress</div>
          <div className="summary-progress-value">
            <div className="CircularProgressbar">
              <text className="CircularProgressbar-text">{progressPercent}%</text>
            </div>
          </div>
        </div>
        <div className="summary-item">
          <div className="summary-title">Signs Learned</div>
          <div className="summary-value">
            <span>{signsLearned}</span>
          </div>
        </div>
        <div className="summary-item">
          <div className="summary-title">Lessons Completed</div>
          <div className="summary-value">
            <span>{lessonsCompleted}</span>
          </div>
        </div>
      </div>
    </div>
  )
}));

jest.mock('../../../frontend/src/components/learnCategoryTile', () => ({
  CategoryTile: ({ name, unlocked, onClick }) => (
    <div 
      className={`category-tile ${unlocked ? 'unlocked' : 'locked'}`}
      onClick={onClick}
    >
      <div className="category-name">{name}</div>
    </div>
  )
}));

jest.mock('../../../frontend/src/components/learnLevelTile', () => ({
  LevelTile: ({ level, unlocked, onClick, style, className }) => (
    <div 
      className={`level-tile ${unlocked ? 'unlocked' : 'locked'} ${className || ''}`}
      onClick={onClick}
      style={style}
    >
      {level}
    </div>
  )
}));

jest.mock('../../../frontend/src/components/angieSigns', () => ({
  AngieSigns: () => <div>Angie Signs</div>
}));

jest.mock('@react-three/fiber', () => ({
  Canvas: ({ children }) => <div className="canvas-mock">{children}</div>
}));

jest.mock('../../../frontend/src/styles/learn.css', () => ({}));

const localStorageMock = {
  getItem: jest.fn(() => null),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

describe("Learn Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useStatUpdater.mockReturnValue(jest.fn());
    localStorageMock.getItem.mockReturnValue(null);
  });

  it("renders default stats when stats is undefined", () => {
    useLearningStats.mockReturnValue({ stats: null });

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
    useLearningStats.mockReturnValue({
      stats: {
        lessonsCompleted: 15,
        learnedSigns: ['a', 'b', 'c', 'd', 'e'], 
        signsLearned: 5,
        streak: 10,
        currentLevel: "Bronze",
        quizzesCompleted: 0,
        unlockedCategories: ['alphabets']
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

    expect(screen.getByText("4%")).toBeInTheDocument();
    expect(screen.getByText("15")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("shows lessons for alphabet when category is clicked", async () => {
    useLearningStats.mockReturnValue({ 
      stats: {
        lessonsCompleted: 0,
        signsLearned: 0,
        learnedSigns: [],
        quizzesCompleted: 0,
        unlockedCategories: ['alphabets']
      }
    }); 

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
    useLearningStats.mockReturnValue({ 
      stats: {
        lessonsCompleted: 0,
        signsLearned: 0,
        learnedSigns: [],
        quizzesCompleted: 0,
        unlockedCategories: ['alphabets'] 
      }
    });

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
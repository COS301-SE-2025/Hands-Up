/**
 * @jest-environment jsdom
 */
import React from "react";
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event'; 
import { render, screen, waitFor } from "@testing-library/react"; 
import { jest, expect, it, describe, beforeEach, afterEach } from '@jest/globals';
import { MemoryRouter } from 'react-router-dom';
import { Learn } from "../../../frontend/src/pages/learn";

import { useLearningStats } from "../../../frontend/src/contexts/learningStatsContext";

// Polyfill for ResizeObserver to fix the test environment
const ResizeObserverMock = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));
global.ResizeObserver = ResizeObserverMock;

// The manual mock for 'react-router-dom' has been removed to prevent conflicts
// with MemoryRouter's context.

jest.mock("../../../frontend/src/contexts/learningStatsContext", () => ({
  useLearningStats: jest.fn(),
}));

// --- Component Mocks (no changes needed here) ---
jest.mock('../../../frontend/src/components/learnSidebar', () => {
    const MockedSidebar = ({ progressPercent, signsLearned, lessonsCompleted }) => (
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
    );
    MockedSidebar.propTypes = {
        progressPercent: require('prop-types').number,
        signsLearned: require('prop-types').number,
        lessonsCompleted: require('prop-types').number,
    };
    return { Sidebar: MockedSidebar };
});
  
jest.mock('../../../frontend/src/components/learnCategoryTile', () => {
    const MockedCategoryTile = ({ name, unlocked, onClick }) => (
        <div 
        className={`category-tile ${unlocked ? 'unlocked' : 'locked'}`}
        onClick={onClick}
        >
        <div className="category-name">{name}</div>
        </div>
    );
    MockedCategoryTile.propTypes = {
        name: require('prop-types').string,
        unlocked: require('prop-types').bool,
        onClick: require('prop-types').func,
    };
    return { CategoryTile: MockedCategoryTile };
});
  
jest.mock('../../../frontend/src/components/learnLevelTile', () => {
    const MockedLevelTile = ({ level, unlocked, onClick, style, className }) => (
        <div 
        className={`level-tile ${unlocked ? 'unlocked' : 'locked'} ${className || ''}`}
        onClick={onClick}
        style={style}
        >
        {level}
        </div>
    );
    MockedLevelTile.propTypes = {
        level: require('prop-types').oneOfType([require('prop-types').string, require('prop-types').number]),
        unlocked: require('prop-types').bool,
        onClick: require('prop-types').func,
        style: require('prop-types').object,
        className: require('prop-types').string,
    };
    return { LevelTile: MockedLevelTile };
});

jest.mock('../../../frontend/src/components/angieSigns', () => ({ AngieSigns: () => <div>Angie Signs</div> }));
jest.mock('@react-three/fiber', () => ({ Canvas: ({ children }) => <div>{children}</div> }));
jest.mock('../../../frontend/src/styles/learn.css', () => ({}));
// --- End of Mocks ---

describe("Learn Page", () => {
  let user;

  beforeEach(() => {
    user = userEvent.setup();
    jest.clearAllMocks();
    
    // Set a default mock for most tests to use
    useLearningStats.mockReturnValue({
      stats: {
        lessonsCompleted: 0,
        signsLearned: 0,
        learnedSigns: [],
        quizzesCompleted: 0,
        unlockedCategories: ['alphabets'],
        placementTestCompleted: true,
        hasSeenWelcome: true,
      },
      isLoading: false,
      hasLoadedFromBackend: true,
      markHelpSeen: jest.fn(),
      completePlacementTest: jest.fn(),
      updateStats: jest.fn(),
    });
  });
  
  afterEach(() => {
    ResizeObserverMock.mockClear();
  });

  it("renders default stats when a user has no progress", () => {
    // Define a default stats object that accurately represents the "empty" state
    const defaultStats = {
        lessonsCompleted: 0,
        signsLearned: 0,
        learnedSigns: [],
        quizzesCompleted: 0,
        unlockedCategories: ['alphabets'],
        placementTestCompleted: false,
    };

    // Use the defaultStats object for this specific test
    useLearningStats.mockReturnValue({ 
      stats: defaultStats, 
      isLoading: false, 
      hasLoadedFromBackend: true 
    });

    render(<MemoryRouter><Learn /></MemoryRouter>);

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
      isLoading: false,
      hasLoadedFromBackend: true,
    });

    render(<MemoryRouter><Learn /></MemoryRouter>);

    expect(screen.getByText("Progress")).toBeInTheDocument();
    expect(screen.getByText(/3\s?%/)).toBeInTheDocument();
    expect(screen.getByText("15")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("shows lessons for alphabet when category is clicked", async () => {
    render(<MemoryRouter><Learn /></MemoryRouter>);
  
    const alphabetCategory = screen.getByText("The Alphabet");
    await user.click(alphabetCategory);
  
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "The Alphabet" })).toBeInTheDocument();
    });
  
    const levelTiles = screen.getAllByText((content) => /^[A-Z]$/.test(content));
    expect(levelTiles.length).toBe(26);
    expect(screen.getByRole("button", { name: /back to categories/i })).toBeInTheDocument();
  });

  it("shows a help message when clicking a locked category", async () => {
    render(<MemoryRouter><Learn /></MemoryRouter>);
  
    const lockedCategory = screen.getByText("Objects & Things");
    await user.click(lockedCategory);

    await waitFor(() => {
        expect(screen.getByText(/Complete the quiz in 'Food & Drinks' to unlock this category!/i)).toBeInTheDocument();
    });
  });
});
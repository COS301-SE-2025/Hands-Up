// /**
//  * @jest-environment jsdom
// */
// import React from "react";
// import { render, screen } from "@testing-library/react";
// import { jest, expect, it, describe, beforeEach} from '@jest/globals';
// import { LearningStats } from "../../../frontend/src/components/learningStats";

// import { useLearningStats } from "../../../frontend/src/context/learningStatsContext";
// import { useStatUpdater } from "../../../frontend/src/hooks/learningStatsUpdater";

// // jest.mock("../../../frontend/src/context/learningStatsContext", () => ({
// //   useLearningStats: jest.fn(),
// // }));

// jest.mock("../../../frontend/src/hooks/learningStatsUpdater", () => ({
//   useStatUpdater: jest.fn(),
// }));

// jest.mock("../../../frontend/src/context/learningStatsContext", () => ({
//   useLearningStats: jest.fn(() => ({ stats: undefined })),
// }));

// describe("LearningStats component", () => {
//   let handleUpdateMock;
//   render(<LearningStats />);

//   beforeEach(() => {
//     handleUpdateMock = jest.fn();
//     (useStatUpdater).mockReturnValue(handleUpdateMock);
//   });


//   it("renders default stats when stats is undefined", () => {
//     (useLearningStats).mockReturnValue({ stats: 0 });

//     // Assert on static texts (these cover your <h3>, <span class="progress-status">, <p class="stat-label"> elements)
//     expect(screen.getByText("Learning Progress")).toBeInTheDocument();
//     expect(screen.getByText("In Progress")).toBeInTheDocument();
//     expect(screen.getByText("Lessons Completed")).toBeInTheDocument();
//     expect(screen.getByText("Signs Learned")).toBeInTheDocument();
//     expect(screen.getByText("Practice Days")).toBeInTheDocument();
//     expect(screen.getByText("Current Level")).toBeInTheDocument();

//     // Assert on dynamic values (these also cover the surrounding HTML)
//     expect(screen.getByText("15/30")).toBeInTheDocument(); // covers stat-value for lessons
//     expect(screen.getByText("5")).toBeInTheDocument();     // covers stat-value for signs
//     expect(screen.getByText("10")).toBeInTheDocument();    // covers stat-value for practice days
//     expect(screen.getByText("Bronze")).toBeInTheDocument(); // covers stat-value for level
//     expect(screen.getByText("50%")).toBeInTheDocument();   // covers progress-percent

//     // Assert on progress bar attributes (covers the progress-bar div and its role/aria attributes)
//     const progressBar = screen.getByRole("progressbar");
//     expect(progressBar).toBeInTheDocument();
//     expect(progressBar).toHaveAttribute("aria-valuenow", "50");
//     expect(progressBar).toHaveAttribute("aria-valuemin", "0");
//     expect(progressBar).toHaveAttribute("aria-valuemax", "100");

//     expect(screen.getByText("0/30")).toBeInTheDocument();
//     expect(screen.getByText("0")).toBeInTheDocument(); // signs learned & practice days default 0
//     expect(screen.getByText("Bronze")).toBeInTheDocument(); // default level
//     expect(screen.getByText("0%")).toBeInTheDocument();
//   });

// //   it("renders stats correctly and calculates progressPercent", () => {
// //     mockUseLearningStats.mockReturnValue({
// //       stats: {
// //         lessonsCompleted: 15,
// //         signsLearned: 5,
// //         streak: 10,
// //         currentLevel: "Bronze",
// //       },
// //     });

// //     render(<LearningStats />);

// //     expect(screen.getByText("15/30")).toBeInTheDocument();
// //     expect(screen.getByText("5")).toBeInTheDocument();
// //     expect(screen.getByText("10")).toBeInTheDocument();
// //     expect(screen.getByText("Bronze")).toBeInTheDocument();

// //     // progressPercent = Math.min(100, round((15/30)*100)) = 50%
// //     expect(screen.getByText("50%")).toBeInTheDocument();
// //   });

// //   it("caps lessonsCompleted at 30 for progress calculation", () => {
// //     mockUseLearningStats.mockReturnValue({
// //       stats: {
// //         lessonsCompleted: 100,
// //         signsLearned: 0,
// //         streak: 0,
// //         currentLevel: "Bronze",
// //       },
// //     });

// //     render(<LearningStats />);

// //     expect(screen.getByText("30/30")).toBeInTheDocument();
// //     expect(screen.getByText("100%")).toBeInTheDocument();
// //   });

// //   it("calls handleUpdate with new level when level differs from currentLevel", () => {
// //     mockUseLearningStats.mockReturnValue({
// //       stats: {
// //         lessonsCompleted: 30,
// //         signsLearned: 40,
// //         streak: 10,
// //         currentLevel: "Bronze",
// //       },
// //     });

// //     render(<LearningStats />);

// //     // totalProgress = 30 + 40 + (10 % 365) = 80
// //     // so level should be "Diamond" (since 75 <= 80 < 100)
// //     expect(handleUpdateMock).toHaveBeenCalledWith("level", "Diamond");
// //   });

// //   it("does NOT call handleUpdate if level matches currentLevel", () => {
// //     mockUseLearningStats.mockReturnValue({
// //       stats: {
// //         lessonsCompleted: 5,
// //         signsLearned: 0,
// //         streak: 0,
// //         currentLevel: "Bronze",
// //       },
// //     });

// //     render(<LearningStats />);

// //     // totalProgress = 5 + 0 + 0 = 5 < 10 so level = Bronze same as currentLevel
// //     expect(handleUpdateMock).not.toHaveBeenCalled();
// //   });

// //   it("calls handleUpdate with new level when level changes to Silver", () => {
// //   mockUseLearningStats.mockReturnValue({
// //     stats: {
// //       lessonsCompleted: 5,
// //       signsLearned: 5,
// //       streak: 0,
// //       currentLevel: "Bronze",
// //     },
// //   });

// //     render(<LearningStats />);
// //     // totalProgress = 5 + 5 + 0 = 10 (should be Silver)
// //     expect(handleUpdateMock).toHaveBeenCalledWith("level", "Silver");
// //   });

// //   it("calls handleUpdate with new level when level changes to Gold", () => {
// //     mockUseLearningStats.mockReturnValue({
// //       stats: {
// //         lessonsCompleted: 10,
// //         signsLearned: 15,
// //         streak: 0,
// //         currentLevel: "Silver",
// //       },
// //     });

// //     render(<LearningStats />);
// //     // totalProgress = 10 + 15 + 0 = 25 (should be Gold)
// //     expect(handleUpdateMock).toHaveBeenCalledWith("level", "Gold");
// //   });

// //   it("calls handleUpdate with new level when level changes to Platinum", () => {
// //     mockUseLearningStats.mockReturnValue({
// //       stats: {
// //         lessonsCompleted: 20,
// //         signsLearned: 25,
// //         streak: 5,
// //         currentLevel: "Gold",
// //       },
// //     });

// //     render(<LearningStats />);
// //     // totalProgress = 20 + 25 + 5 = 50 (should be Platinum)
// //     expect(handleUpdateMock).toHaveBeenCalledWith("level", "Platinum");
// //   });

// //   it("calls handleUpdate with new level when level changes to Ruby", () => {
// //     mockUseLearningStats.mockReturnValue({
// //       stats: {
// //         lessonsCompleted: 30,
// //         signsLearned: 60,
// //         streak: 10,
// //         currentLevel: "Diamond",
// //       },
// //     });

// //     render(<LearningStats />);
// //     // totalProgress = 30 + 60 + 10 = 100 (should be Ruby)
// //     expect(handleUpdateMock).toHaveBeenCalledWith("level", "Ruby");
// //   });

// //     describe("LearningStats component - Level Calculation Coverage", () => {
// //   let handleUpdateMock;

// //   beforeEach(() => {
// //     handleUpdateMock = jest.fn();
// //     mockUseStatUpdater.mockReturnValue(handleUpdateMock);
// //   });

// //   // This test ensures the 'Bronze' level is correctly assigned and that handleUpdate is NOT called if currentLevel is already 'Bronze'.
// //   it("assigns 'Bronze' level when totalProgress is less than 10 and does not call handleUpdate if currentLevel is Bronze", () => {
// //     mockUseLearningStats.mockReturnValue({
// //       stats: {
// //         lessonsCompleted: 5, // totalProgress = 5 + 0 + 0 = 5
// //         signsLearned: 0,
// //         streak: 0,
// //         currentLevel: "Bronze",
// //       },
// //     });

// //     render(<LearningStats />);
// //     expect(screen.getByText("Bronze")).toBeInTheDocument(); // Checks rendering
// //     expect(handleUpdateMock).not.toHaveBeenCalled(); // Ensures no update if level is same
// //   });

// //   // Covers `totalProgress < 25` resulting in "Silver"
// //   it("assigns 'Silver' level when totalProgress is between 10 and 24, and calls handleUpdate if currentLevel differs", () => {
// //     mockUseLearningStats.mockReturnValue({
// //       stats: {
// //         lessonsCompleted: 8,
// //         signsLearned: 2, // totalProgress = 8 + 2 + 0 = 10
// //         streak: 0,
// //         currentLevel: "Bronze", // Current level is Bronze, new level is Silver
// //       },
// //     });

// //     render(<LearningStats />);
// //     expect(screen.getByText("Silver")).toBeInTheDocument();
// //     expect(handleUpdateMock).toHaveBeenCalledWith("level", "Silver");
// //   });

// //   // Covers `totalProgress < 50` resulting in "Gold"
// //   it("assigns 'Gold' level when totalProgress is between 25 and 49, and calls handleUpdate if currentLevel differs", () => {
// //     mockUseLearningStats.mockReturnValue({
// //       stats: {
// //         lessonsCompleted: 15,
// //         signsLearned: 10, // totalProgress = 15 + 10 + 0 = 25
// //         streak: 0,
// //         currentLevel: "Silver", // Current level is Silver, new level is Gold
// //       },
// //     });

// //     render(<LearningStats />);
// //     expect(screen.getByText("Gold")).toBeInTheDocument();
// //     expect(handleUpdateMock).toHaveBeenCalledWith("level", "Gold");
// //   });

// //   // Covers `totalProgress < 75` resulting in "Platinum"
// //   it("assigns 'Platinum' level when totalProgress is between 50 and 74, and calls handleUpdate if currentLevel differs", () => {
// //     mockUseLearningStats.mockReturnValue({
// //       stats: {
// //         lessonsCompleted: 25,
// //         signsLearned: 25, // totalProgress = 25 + 25 + 0 = 50
// //         streak: 0,
// //         currentLevel: "Gold", // Current level is Gold, new level is Platinum
// //       },
// //     });

// //     render(<LearningStats />);
// //     expect(screen.getByText("Platinum")).toBeInTheDocument();
// //     expect(handleUpdateMock).toHaveBeenCalledWith("level", "Platinum");
// //   });

// //   // Covers `totalProgress < 100` resulting in "Diamond"
// //   it("assigns 'Diamond' level when totalProgress is between 75 and 99, and calls handleUpdate if currentLevel differs", () => {
// //     mockUseLearningStats.mockReturnValue({
// //       stats: {
// //         lessonsCompleted: 30, // capped at 30
// //         signsLearned: 45, // totalProgress = 30 + 45 + 0 = 75
// //         streak: 0,
// //         currentLevel: "Platinum", // Current level is Platinum, new level is Diamond
// //       },
// //     });

// //     render(<LearningStats />);
// //     expect(screen.getByText("Diamond")).toBeInTheDocument();
// //     expect(handleUpdateMock).toHaveBeenCalledWith("level", "Diamond");
// //   });

// //   // Covers `else` block (totalProgress >= 100) resulting in "Ruby"
// //   it("assigns 'Ruby' level when totalProgress is 100 or greater, and calls handleUpdate if currentLevel differs", () => {
// //     mockUseLearningStats.mockReturnValue({
// //       stats: {
// //         lessonsCompleted: 30, // capped at 30
// //         signsLearned: 70, // totalProgress = 30 + 70 + 0 = 100
// //         streak: 0,
// //         currentLevel: "Diamond", // Current level is Diamond, new level is Ruby
// //       },
// //     });

// //     render(<LearningStats />);
// //     expect(screen.getByText("Ruby")).toBeInTheDocument();
// //     expect(handleUpdateMock).toHaveBeenCalledWith("level", "Ruby");
// //   });

// //   // Test to ensure no update call if calculated level is already the current level, covering other levels
// //   it("does NOT call handleUpdate if level matches currentLevel for Silver", () => {
// //     mockUseLearningStats.mockReturnValue({
// //       stats: {
// //         lessonsCompleted: 10,
// //         signsLearned: 0,
// //         streak: 0,
// //         currentLevel: "Silver", // totalProgress = 10 (should be Silver)
// //       },
// //     });
// //     render(<LearningStats />);
// //     expect(handleUpdateMock).not.toHaveBeenCalled();
// //   });

// //   it("does NOT call handleUpdate if level matches currentLevel for Ruby", () => {
// //     mockUseLearningStats.mockReturnValue({
// //       stats: {
// //         lessonsCompleted: 30,
// //         signsLearned: 70,
// //         streak: 0,
// //         currentLevel: "Ruby", // totalProgress = 100 (should be Ruby)
// //       },
// //     });
// //     render(<LearningStats />);
// //     expect(handleUpdateMock).not.toHaveBeenCalled();
// //   });
// // });
// });

// // // jest.mock("../../../frontend/src/utils/apiCalls");

// // // describe("LearningStatsProvider unit tests", () => {
// // //   const mockUsername = "tester1";

// // //   beforeEach(() => {
// // //     // Mock localStorage.getItem
// // //     jest.spyOn(window.localStorage.__proto__, "getItem").mockImplementation((key) => {
// // //       if (key === "username") return mockUsername;
// // //       return null;
// // //     });
// // //   });

// // //   afterEach(() => {
// // //     jest.clearAllMocks();
// // //   });

// // //   // Helper test component to access context values
// // //   function TestComponent() {
// // //     const { stats, updateStats } = useLearningStats();
// // //     return (
// // //       <div>
// // //         <span data-testid="stats">{JSON.stringify(stats)}</span>
// // //         <button
// // //           data-testid="update-btn"
// // //           onClick={() => updateStats({ lessonsCompleted: 42 })}
// // //         >
// // //           Update
// // //         </button>
// // //       </div>
// // //     );
// // //   }

// // //   it("loads stats on mount and sets stats state", async () => {
// // //     const fakeStats = { lessonsCompleted: 10 };
// // //     api.getLearningProgress.mockResolvedValue({ data: [fakeStats] });

// // //     let container;
// // //     await act(async () => {
// // //       ({ container } = render(
// // //         <LearningStatsProvider>
// // //           <TestComponent />
// // //         </LearningStatsProvider>
// // //       ));
// // //     });

// // //     const statsElem = container.querySelector("[data-testid=stats]");
// // //     expect(statsElem.textContent).toBe(JSON.stringify(fakeStats));
// // //     expect(api.getLearningProgress).toHaveBeenCalledWith(mockUsername);
// // //   });

// // //   it("handles failure to load stats without setting stats", async () => {
// // //     api.getLearningProgress.mockRejectedValue(new Error("fail"));

// // //     jest.spyOn(console, "error").mockImplementation(() => {});

// // //     let container;
// // //     await act(async () => {
// // //       ({ container } = render(
// // //         <LearningStatsProvider>
// // //           <TestComponent />
// // //         </LearningStatsProvider>
// // //       ));
// // //     });

// // //     const statsElem = container.querySelector("[data-testid=stats]");
// // //     expect(statsElem.textContent).toBe("null");
// // //     expect(console.error).toHaveBeenCalledWith(
// // //       "Failed to load learning stats",
// // //       expect.any(Error)
// // //     );

// // //     console.error.mockRestore();
// // //   });

// // //   it("updateStats updates stats and calls API on success", async () => {
// // //     const initialStats = { lessonsCompleted: 10 };
// // //     api.getLearningProgress.mockResolvedValue({ data: [initialStats] });
// // //     api.updateLearningProgress.mockResolvedValue({ status: "success" });

// // //     let container;
// // //     await act(async () => {
// // //       ({ container } = render(
// // //         <LearningStatsProvider>
// // //           <TestComponent />
// // //         </LearningStatsProvider>
// // //       ));
// // //     });

// // //     const statsElem = container.querySelector("[data-testid=stats]");
// // //     expect(statsElem.textContent).toBe(JSON.stringify(initialStats));

// // //     // Click update button to call updateStats
// // //     const button = container.querySelector("[data-testid=update-btn]");

// // //     await act(async () => {
// // //       button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
// // //     });

// // //     // Expect updated stats shown
// // //     expect(statsElem.textContent).toContain('"lessonsCompleted":42');
// // //     expect(api.updateLearningProgress).toHaveBeenCalledWith(mockUsername, {
// // //       ...initialStats,
// // //       lessonsCompleted: 42,
// // //     });
// // //   });

// // //   it("does not update stats and logs error if API update fails", async () => {
// // //     const initialStats = { lessonsCompleted: 10 };
// // //     api.getLearningProgress.mockResolvedValue({ data: [initialStats] });
// // //     api.updateLearningProgress.mockResolvedValue({ status: "error" });

// // //     jest.spyOn(console, "error").mockImplementation(() => {});

// // //     let container;
// // //     await act(async () => {
// // //       ({ container } = render(
// // //         <LearningStatsProvider>
// // //           <TestComponent />
// // //         </LearningStatsProvider>
// // //       ));
// // //     });

// // //     const button = container.querySelector("[data-testid=update-btn]");

// // //     await act(async () => {
// // //       button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
// // //     });

// // //     const statsElem = container.querySelector("[data-testid=stats]");
// // //     expect(statsElem.textContent).toBe(JSON.stringify(initialStats));
// // //     expect(console.error).toHaveBeenCalledWith("Failed to update stats");

// // //     console.error.mockRestore();
// // //   });
// // // });

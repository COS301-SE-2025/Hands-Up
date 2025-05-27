
// import React from 'react';
// import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// import Login from '../../../frontend/src/pages/Login';
// import { BrowserRouter } from 'react-router-dom';
// import '@testing-library/jest-dom/extend-expect';


// jest.mock('../hooks/learningStatsUpdater', () => ({
//   useStatUpdater: () => jest.fn(),
// }));

// const mockedNavigate = jest.fn();
// jest.mock('react-router-dom', () => {
//   const original = jest.requireActual('react-router-dom');
//   return {
//     ...original,
//     useNavigate: () => mockedNavigate,
//   };
// });

// describe('Login Component', () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   function setup() {
//     render(
//       <BrowserRouter>
//         <Login />
//       </BrowserRouter>
//     );
//   }

//   test('renders login form elements', () => {
//     setup();
//     expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
//     expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
//     expect(screen.getByRole('button', { name: /Log In/i })).toBeInTheDocument();
//   });

//   test('shows error when fields are empty', () => {
//     setup();
//     fireEvent.click(screen.getByRole('button', { name: /Log In/i }));
//     expect(screen.getByText(/Please enter both email and password/i)).toBeInTheDocument();
//   });

//   test('handles successful login', async () => {
//     setup();

//     global.fetch = jest.fn(() =>
//       Promise.resolve({
//         ok: true,
//         json: () =>
//           Promise.resolve({
//             user: { id: 1, name: 'Test User' },
//           }),
//       })
//     );

//     fireEvent.change(screen.getByLabelText(/Email Address/i), {
//       target: { value: 'test@example.com' },
//     });
//     fireEvent.change(screen.getByLabelText(/Password/i), {
//       target: { value: 'password123' },
//     });

//     fireEvent.click(screen.getByRole('button', { name: /Log In/i }));

//     await waitFor(() => {
//       expect(localStorage.setItem).toHaveBeenCalledWith('isLoggedIn', 'true');
//       expect(mockedNavigate).toHaveBeenCalledWith('/userProfile');
//     });
//   });

//   test('shows error on failed login', async () => {
//     setup();

//     global.fetch = jest.fn(() =>
//       Promise.resolve({
//         ok: false,
//         json: () => Promise.resolve({ error: 'Invalid credentials' }),
//       })
//     );

//     fireEvent.change(screen.getByLabelText(/Email Address/i), {
//       target: { value: 'wrong@example.com' },
//     });
//     fireEvent.change(screen.getByLabelText(/Password/i), {
//       target: { value: 'wrongpass' },
//     });

//     fireEvent.click(screen.getByRole('button', { name: /Log In/i }));

//     await waitFor(() => {
//       expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
//     });
//   });
// });

// import React from 'react';
// import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// import SignupPage from '../../../frontend/src/pages/Signup';
// import '@testing-library/jest-dom/extend-expect';

// // Mock window.alert
// beforeAll(() => {
//   jest.spyOn(window, 'alert').mockImplementation(() => {});
// });

// afterAll(() => {
//   window.alert.mockRestore();
// });

// describe('SignupPage', () => {
//   beforeEach(() => {
//     render(<SignupPage />);
//   });

//   it('renders all input fields', () => {
//     expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
//     expect(screen.getByLabelText(/Surname/i)).toBeInTheDocument();
//     expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
//     expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
//     expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();
//     expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
//   });

//   it('alerts if form is submitted with empty fields', () => {
//     fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }));
//     expect(window.alert).toHaveBeenCalledWith('Please fill in all fields.');
//   });

//   it('alerts if password is weak (no special character or < 8 chars)', () => {
//     fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'John' } });
//     fireEvent.change(screen.getByLabelText(/Surname/i), { target: { value: 'Doe' } });
//     fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'johndoe' } });
//     fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'john@example.com' } });
//     fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'weakpass' } });
//     fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: 'weakpass' } });

//     fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }));
//     expect(window.alert).toHaveBeenCalledWith(
//       'Password must be at least 8 characters long and contain at least one special character.'
//     );
//   });

//   it('alerts if passwords do not match', () => {
//     fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'John' } });
//     fireEvent.change(screen.getByLabelText(/Surname/i), { target: { value: 'Doe' } });
//     fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'johndoe' } });
//     fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'john@example.com' } });
//     fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'Pass@1234' } });
//     fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: 'Mismatch1!' } });

//     fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }));
//     expect(window.alert).toHaveBeenCalledWith('Passwords do not match.');
//   });

//   it('handles successful signup', async () => {
//     global.fetch = jest.fn(() =>
//       Promise.resolve({
//         ok: true,
//         json: () => Promise.resolve({ user: { username: 'johndoe' } }),
//       })
//     );

//     fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'John' } });
//     fireEvent.change(screen.getByLabelText(/Surname/i), { target: { value: 'Doe' } });
//     fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'johndoe' } });
//     fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'john@example.com' } });
//     fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'Pass@1234' } });
//     fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: 'Pass@1234' } });

//     fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }));

//     await waitFor(() => {
//       expect(window.alert).toHaveBeenCalledWith('Signup successful! Welcome johndoe');
//     });
//   });

//   it('handles signup failure', async () => {
//     global.fetch = jest.fn(() =>
//       Promise.resolve({
//         ok: false,
//         json: () => Promise.resolve({ error: 'Email already exists' }),
//       })
//     );

//     fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'John' } });
//     fireEvent.change(screen.getByLabelText(/Surname/i), { target: { value: 'Doe' } });
//     fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'johndoe' } });
//     fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'john@example.com' } });
//     fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'Pass@1234' } });
//     fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: 'Pass@1234' } });

//     fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }));

//     await waitFor(() => {
//       expect(window.alert).toHaveBeenCalledWith('Email already exists');
//     });
//   });
// });

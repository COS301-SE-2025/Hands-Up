// /**
//  * @jest-environment jsdom
// */

// import React from 'react';
// import { jest, expect, beforeEach, afterEach, test} from '@jest/globals';
// import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// import UserProfile from '../../../frontend/src/pages/userProfile'; 
// import * as api from '../../../frontend/src/utils/apiCalls';
// import { MemoryRouter } from 'react-router-dom';

// // Mock the API calls
// jest.mock('../../../frontend/src/utils/apiCalls');

// beforeEach(() => {
//   localStorage.setItem('isLoggedIn', 'true');
//   localStorage.setItem('userData', JSON.stringify({
//     userID: '12',
//     name: 'Pinky',
//     surname: 'Palmer',
//     username: 'pinkylicious',
//     email: 'pinky@test.com'
//   }));
// })

// afterEach(() => {
//   localStorage.clear();
//   jest.clearAllMocks();
// });

// const setup = async () => {
//   render(
//     <MemoryRouter>
//       <UserProfile />
//     </MemoryRouter>
//   );
  
//   await waitFor(() => expect(screen.getByText(/Profile Settings/i)).toBeInTheDocument());
// };

// test('shows error when no changes are made', async () => {
//   await setup();

//   const saveButton = screen.getByText(/Save Changes/i);
//   fireEvent.click(saveButton);

//   await waitFor(() => {
//     expect(screen.getByText(/No changes detected to save/i)).toBeInTheDocument();
//   });
// });

// test('validates empty fields and shows errors', async () => {
//   await setup();

//   fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: '' } });
//   fireEvent.change(screen.getByLabelText(/Surname/i), { target: { value: '' } });
//   fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: '' } });
//   fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: '' } });

//   fireEvent.click(screen.getByText(/Save Changes/i));

//   await waitFor(() => {
//     expect(screen.getByText(/Name is required/i)).toBeInTheDocument();
//     expect(screen.getByText(/Surname is required/i)).toBeInTheDocument();
//     expect(screen.getByText(/Username is required/i)).toBeInTheDocument();
//     expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
//   });
// });

// test('handles username already taken', async () => {
//   api.uniqueUsername.mockResolvedValue(true); // Username exists
//   api.uniqueEmail.mockResolvedValue(false);

//   await setup();

//   fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'takenUsername' } });

//   fireEvent.click(screen.getByText(/Save Changes/i));

//   await waitFor(() => {
//     expect(screen.getByText(/Username already taken/i)).toBeInTheDocument();
//   });
// });

// test('handles email already in use', async () => {
//   api.uniqueUsername.mockResolvedValue(false);
//   api.uniqueEmail.mockResolvedValue(true); // Email exists

//   await setup();

//   fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'taken@example.com' } });

//   fireEvent.click(screen.getByText(/Save Changes/i));

//   await waitFor(() => {
//     expect(screen.getByText(/Email already in use/i)).toBeInTheDocument();
//   });
// });

// test('updates user details without password', async () => {
//   api.uniqueUsername.mockResolvedValue(false);
//   api.uniqueEmail.mockResolvedValue(false);
//   api.updateUserDetails.mockResolvedValue({ success: true });

//   window.alert = jest.fn();

//   await setup();

//   fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Dexter' } });
//   fireEvent.change(screen.getByLabelText(/Surname/i), { target: { value: 'Handley' } });
//   fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'dex__ley' } });
//   fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'dexter@test.com' } });

//   fireEvent.click(screen.getByText(/Save Changes/i));

//   await waitFor(() => {
//     expect(api.updateUserDetails).toHaveBeenCalled();
//     expect(window.alert).toHaveBeenCalledWith('User updated successfully!');
//   });
// });

// test('validates mismatching passwords', async () => {
//   await setup();

//   fireEvent.change(screen.getByLabelText(/New Password/i), { target: { value: '123456' } });
//   fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: '654321' } });

//   fireEvent.click(screen.getByText(/Save Changes/i));

//   await waitFor(() => {
//     expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
//   });
// });

// test('updates user details with password', async () => {
//   api.uniqueUsername.mockResolvedValue(false);
//   api.uniqueEmail.mockResolvedValue(false);
//   api.updateUserPassword.mockResolvedValue({ success: true });

//   window.alert = jest.fn();

//   await setup();

//   fireEvent.change(screen.getByLabelText(/New Password/i), { target: { value: 'abc12345' } });
//   fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: 'abc12345' } });

//   fireEvent.click(screen.getByText(/Save Changes/i));

//   await waitFor(() => {
//     expect(api.updateUserPassword).toHaveBeenCalled();
//     expect(window.alert).toHaveBeenCalledWith('User updated successfully!');
//   });
// });
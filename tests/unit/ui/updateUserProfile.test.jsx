// /**
//  * @jest-environment jsdom
// */
// import React from 'react';
// import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// import { MemoryRouter } from 'react-router-dom';
// import { UserProfile } from '../../../frontend/src/pages/userProfile';
// import { useAuth } from '../../../frontend/src/contexts/authContext.js';
// import { uniqueUsername, uniqueEmail, updateUserDetails, updateUserPassword, deleteUserAccount, uploadUserAvatar } from '../../../frontend/src/utils/apiCalls.js';
// import '@testing-library/jest-dom';

// jest.mock('../../../frontend/src/contexts/authContext.js', () => ({
//     useAuth: jest.fn(),
// }));

// jest.mock('../../../frontend/src/utils/apiCalls.js', () => ({
//     uniqueUsername: jest.fn(),
//     uniqueEmail: jest.fn(),
//     updateUserDetails: jest.fn(),
//     updateUserPassword: jest.fn(),
//     deleteUserAccount: jest.fn(),
//     uploadUserAvatar: jest.fn(),
// }));

// const mockedUsedNavigate = jest.fn();
// jest.mock('react-router-dom', () => ({
//     ...jest.requireActual('react-router-dom'),
//     useNavigate: () => mockedUsedNavigate,
// }));

// const mockCurrentUser = {
//     id: 12,
//     name: 'Pinky',
//     surname: 'Palmer',
//     username: 'pinkylicious',
//     email: 'pinky@test.com',
//     avatarurl: '',
//     createdAt: '2025-01-01T00:00:00.000Z',
// };

// const setup = (authProps = {}) => {
//     useAuth.mockReturnValue({
//         currentUser: mockCurrentUser,
//         isLoggedIn: true,
//         loading: false,
//         logout: jest.fn(),
//         updateUser: jest.fn(),
//         ...authProps,
//     });

//     render(
//         <MemoryRouter>
//           <UserProfile />
//        </MemoryRouter>
//     );
// };

// describe('UserProfile', () => {
//     beforeEach(() => {
//         jest.clearAllMocks();
//     });

//     test('redirects to login if not logged in', () => {
//         setup({ isLoggedIn: false, loading: false });
//         expect(mockedUsedNavigate).toHaveBeenCalledWith('/login');
//     });

//     test('renders user profile details when logged in', async () => {
//         setup();
//         await waitFor(() => {
//             expect(screen.getByText(/Pinky Palmer/i)).toBeInTheDocument();
//             expect(screen.getByText(/@pinkylicious/i)).toBeInTheDocument();
//             expect(screen.getByText(/pinky@test.com/i)).toBeInTheDocument();
//         });
//     });

//     test('opens and closes edit profile form', async () => {
//         setup();
//         await waitFor(() => expect(screen.getByRole('button', { name: /Edit Profile/i })).toBeInTheDocument());

//         fireEvent.click(screen.getByRole('button', { name: /Edit Profile/i }));
//         expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
//         expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
//         expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
//         expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();

//         fireEvent.click(screen.getByLabelText(/Close edit form/i));
//         expect(screen.queryByLabelText(/First Name/i)).not.toBeInTheDocument();
//     });

//     test('populates edit form with current user data', async () => {
//         setup();
//         await waitFor(() => expect(screen.getByRole('button', { name: /Edit Profile/i })).toBeInTheDocument());
//         fireEvent.click(screen.getByRole('button', { name: /Edit Profile/i }));

//         expect(screen.getByLabelText(/First Name/i)).toHaveValue(mockCurrentUser.name);
//         expect(screen.getByLabelText(/Last Name/i)).toHaveValue(mockCurrentUser.surname);
//         expect(screen.getByLabelText(/Username/i)).toHaveValue(mockCurrentUser.username);
//         expect(screen.getByLabelText(/Email/i)).toHaveValue(mockCurrentUser.email);
//     });

//     test('handles input changes in the edit form', async () => {
//         setup();
//         await waitFor(() => expect(screen.getByRole('button', { name: /Edit Profile/i })).toBeInTheDocument());
//         fireEvent.click(screen.getByRole('button', { name: /Edit Profile/i }));

//         const nameInput = screen.getByLabelText(/First Name/i);
//         fireEvent.change(nameInput, { target: { value: 'Angie' } });
//         expect(nameInput).toHaveValue('Angie');
//     });

//     test('shows validation errors for empty fields on save', async () => {
//         setup();
//         await waitFor(() => expect(screen.getByRole('button', { name: /Edit Profile/i })).toBeInTheDocument());
//         fireEvent.click(screen.getByRole('button', { name: /Edit Profile/i }));

//         fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: '' } });
//         fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: '' } });
//         fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: '' } });
//         fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: '' } });
//         fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));
        
//         expect(await screen.findByText('Name is required.')).toBeInTheDocument(); 
//         expect(screen.getByText('Surname is required.')).toBeInTheDocument(); 
//         expect(screen.getByText('Username is required.')).toBeInTheDocument(); 
//         expect(screen.getByText('Email is required.')).toBeInTheDocument(); 
//     });

//     test('shows validation errors for invalid name/surname format', async () => {
//         setup();
//         await waitFor(() => expect(screen.getByRole('button', { name: /Edit Profile/i })).toBeInTheDocument());
//         fireEvent.click(screen.getByRole('button', { name: /Edit Profile/i }));

//         fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'Angie23' } });
//         fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: 'Handston!' } });
//         fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));

//         expect(await screen.findByText('Name must contain only letters and spaces.')).toBeInTheDocument();
//         expect(screen.getByText('Surname must contain only letters and spaces.')).toBeInTheDocument();
//     });

//     test('shows validation error for invalid email format', async () => {
//         setup();
//         await waitFor(() => expect(screen.getByRole('button', { name: /Edit Profile/i })).toBeInTheDocument());
//         fireEvent.click(screen.getByRole('button', { name: /Edit Profile/i }));

//         fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'invalid@email' } });
//         screen.debug();
//         fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));

//         expect(await screen.findByText('Invalid email format.')).toBeInTheDocument();
//     });

//     test('shows error if no changes are detected when saving', async () => {
//         setup();
//         await waitFor(() => expect(screen.getByRole('button', { name: /Edit Profile/i })).toBeInTheDocument());
//         fireEvent.click(screen.getByRole('button', { name: /Edit Profile/i }));

//         fireEvent.click(screen.getByRole('button', { name: /Save Changes/i })); 

//         expect(await screen.findByText('No changes detected to save.')).toBeInTheDocument();
//         expect(updateUserDetails).not.toHaveBeenCalled();
//         expect(updateUserPassword).not.toHaveBeenCalled();
//         expect(uploadUserAvatar).not.toHaveBeenCalled();
//     });

//     test('shows error if new username is already taken', async () => {
//         uniqueUsername.mockResolvedValue(true);

//         setup();
//         await waitFor(() => expect(screen.getByRole('button', { name: /Edit Profile/i })).toBeInTheDocument());
//         fireEvent.click(screen.getByRole('button', { name: /Edit Profile/i }));

//         fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'existing_username' } });
//         fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));

//         expect(await screen.findByText('Username already taken.')).toBeInTheDocument();
//         expect(uniqueUsername).toHaveBeenCalledWith('existing_username');
//     });

//     test('shows error if new email is already in use', async () => {
//         uniqueUsername.mockResolvedValue(false); 
//         uniqueEmail.mockResolvedValue(true);  

//         setup();
//         await waitFor(() => expect(screen.getByRole('button', { name: /Edit Profile/i })).toBeInTheDocument());
//         fireEvent.click(screen.getByRole('button', { name: /Edit Profile/i }));

//         fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'angie@test.com' } });
//         fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));

//         expect(await screen.findByText('Email already in use.')).toBeInTheDocument();
//         expect(uniqueEmail).toHaveBeenCalledWith('angie@test.com');
//     });

//     test('shows error if new passwords do not match', async () => {
//         setup();
//         await waitFor(() => expect(screen.getByRole('button', { name: /Edit Profile/i })).toBeInTheDocument());
//         fireEvent.click(screen.getByRole('button', { name: /Edit Profile/i }));

//         fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'newPassword123' } });
//         fireEvent.change(screen.getByLabelText('Confirm New Password'), { target: { value: 'differentPassword' } });
//         fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));

//         expect(await screen.findByText('Passwords do not match.')).toBeInTheDocument();
//         expect(updateUserPassword).not.toHaveBeenCalled();
//     });

//     test('shows error if new password does not meet requirements', async () => {
//         setup();
//         await waitFor(() => expect(screen.getByRole('button', { name: /Edit Profile/i })).toBeInTheDocument());
//         fireEvent.click(screen.getByRole('button', { name: /Edit Profile/i }));

//         fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'short' } });
//         fireEvent.change(screen.getByLabelText('Confirm New Password'), { target: { value: 'short' } });
//         fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));

//         expect(await screen.findByText('Password must be at least 8 characters long.')).toBeInTheDocument();
//         expect(updateUserPassword).not.toHaveBeenCalled();
//     });

//     test('opens account deletion confirmation modal (step 1)', async () => {
//         setup();
//         await waitFor(() => expect(screen.getByRole('button', { name: /Delete Account/i })).toBeInTheDocument());

//         fireEvent.click(screen.getByRole('button', { name: /Delete Account/i }));
//         expect(screen.getByText(/Confirm Account Deletion/i)).toBeInTheDocument();
//         expect(screen.getByText(/Deleting your account is a permanent action./i)).toBeInTheDocument();
//         expect(screen.getByRole('button', { name: /Proceed/i })).toBeInTheDocument();
//     });

//     test('proceeds to final deletion confirmation step (step 2)', async () => {
//         setup();
//         await waitFor(() => expect(screen.getByRole('button', { name: /Delete Account/i })).toBeInTheDocument());
//         fireEvent.click(screen.getByRole('button', { name: /Delete Account/i }));

//         fireEvent.click(screen.getByRole('button', { name: /Proceed/i }));
//         expect(screen.getByText(/Final Confirmation/i)).toBeInTheDocument();
//         expect(screen.getByText(/To confirm deletion, please type "DELETE" into the box below./i)).toBeInTheDocument();
//         expect(screen.getByPlaceholderText(/Type DELETE to confirm/i)).toBeInTheDocument();
//     });

//     test('cancels deletion from any step', async () => {
//         setup();
//         await waitFor(() => expect(screen.getByRole('button', { name: /Delete Account/i })).toBeInTheDocument());
//         fireEvent.click(screen.getByRole('button', { name: /Delete Account/i }));
//         expect(screen.getByText(/Confirm Account Deletion/i)).toBeInTheDocument();

//         fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
//         expect(screen.queryByText(/Confirm Account Deletion/i)).not.toBeInTheDocument();

//         fireEvent.click(screen.getByRole('button', { name: /Delete Account/i }));
//         fireEvent.click(screen.getByRole('button', { name: /Proceed/i }));
//         expect(screen.getByText(/Final Confirmation/i)).toBeInTheDocument();

//         fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
//         expect(screen.queryByText(/Final Confirmation/i)).not.toBeInTheDocument();
//     });

//     test('requires exact "DELETE" text for final confirmation', async () => {
//         setup();
//         await waitFor(() => expect(screen.getByRole('button', { name: /Delete Account/i })).toBeInTheDocument());
//         fireEvent.click(screen.getByRole('button', { name: /Delete Account/i }));
//         fireEvent.click(screen.getByRole('button', { name: /Proceed/i }));

//         const confirmInput = screen.getByPlaceholderText(/Type DELETE to confirm/i);
        
//         const deleteButtons = screen.getAllByRole('button', { name: /Delete Account/i });
//         const finalDeleteButton = deleteButtons.find(button => button.className.includes('btn-danger'));
//         expect(finalDeleteButton).toBeDisabled();

//         fireEvent.change(confirmInput, { target: { value: 'delete' } }); 
//         expect(finalDeleteButton).toBeDisabled();
//         expect(deleteUserAccount).not.toHaveBeenCalled();

//         fireEvent.change(confirmInput, { target: { value: 'DELET' } }); 
//         expect(finalDeleteButton).toBeDisabled();
//         expect(deleteUserAccount).not.toHaveBeenCalled();
        
//         fireEvent.change(confirmInput, { target: { value: 'DELETE' } });
//         expect(finalDeleteButton).toBeEnabled()
//         fireEvent.click(finalDeleteButton);
//         expect(deleteUserAccount).toHaveBeenCalled();
//     });

//     test('calls logout function when Log Out button is clicked', async () => {
//         const mockLogout = jest.fn();
//         setup({ logout: mockLogout });
//         await waitFor(() => expect(screen.getByRole('button', { name: /Log Out/i })).toBeInTheDocument());

//         fireEvent.click(screen.getByRole('button', { name: /Log Out/i }));
//         expect(mockLogout).toHaveBeenCalledTimes(1);
//     });

//     test('opens and displays the terms and conditions', async () => {
//         setup();
//         await waitFor(() => expect(screen.getByRole('button', { name: /View Terms and Conditions/i })).toBeInTheDocument());
//         fireEvent.click(screen.getByRole('button', { name: /View Terms and Conditions/i }));

//         const headings = await screen.findAllByText(/Terms and Conditions/i);
//         expect(headings[0]).toBeInTheDocument();
//         expect(screen.getByText(/1. Acceptance of Terms/i)).toBeInTheDocument();
//         expect(screen.getByText(/2. Description of Service/i)).toBeInTheDocument();
//     });
// });
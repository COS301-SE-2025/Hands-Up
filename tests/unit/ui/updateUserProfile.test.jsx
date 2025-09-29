/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { UserProfile } from '../../../frontend/src/pages/userProfile';
import { useAuth } from '../../../frontend/src/contexts/authContext.js';
import { updateUserDetails, updateUserPassword, deleteUserAccount, uploadUserAvatar } from '../../../frontend/src/utils/apiCalls.js';
import '@testing-library/jest-dom';

// Mock the LoadingSpinner component
jest.mock('../../../frontend/src/components/loadingSpinner', () => {
    return function LoadingSpinner() {
        return <div data-testid="loading-spinner">Loading...</div>;
    };
});

// Mock the DexterityToggle component
jest.mock('../../../frontend/src/components/dexterityToggle.js', () => ({
    DexterityToggle: () => <div data-testid="dexterity-toggle">Dexterity Toggle</div>
}));

jest.mock('../../../frontend/src/contexts/authContext.js', () => ({
    useAuth: jest.fn(),
}));

jest.mock('../../../frontend/src/contexts/dexterityContext.js', () => ({
    useDexterity: () => ({
        dexterity: 'right',
        toggleDexterity: jest.fn(),
    }),
}));

jest.mock('../../../frontend/src/utils/apiCalls.js', () => ({
    uniqueUsername: jest.fn(),
    uniqueEmail: jest.fn(),
    updateUserDetails: jest.fn(),
    updateUserPassword: jest.fn(),
    deleteUserAccount: jest.fn(),
    uploadUserAvatar: jest.fn(),
    deleteUserAvatar: jest.fn(),
}));

const mockedUsedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockedUsedNavigate,
}));

const mockCurrentUser = {
    id: 12,
    name: 'Pinky',
    surname: 'Palmer',
    username: 'pinkylicious',
    email: 'pinky@test.com',
    avatarurl: '',
    createdAt: '2025-01-01T00:00:00.000Z',
};

const setup = (authProps = {}) => {
    useAuth.mockReturnValue({
        currentUser: mockCurrentUser,
        isLoggedIn: true,
        loading: false,
        logout: jest.fn(),
        updateUser: jest.fn(),
        ...authProps,
    });

    return render(
        <MemoryRouter>
            <UserProfile />
        </MemoryRouter>
    );
};

describe('UserProfile', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Clear any console errors/warnings between tests
        jest.spyOn(console, 'error').mockImplementation(() => {});
        jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        // Restore console methods
        console.error.mockRestore?.();
        console.warn.mockRestore?.();
    });

    test('redirects to login if not logged in', () => {
        setup({ isLoggedIn: false, loading: false });
        expect(mockedUsedNavigate).toHaveBeenCalledWith('/login');
    });

    test('renders user profile details when logged in', async () => {
        setup();
        
        // Wait for the component to finish loading
        await waitFor(() => {
            expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
        });
        
        // Check for user details
        await waitFor(() => {
            expect(screen.getByText('Pinky Palmer')).toBeInTheDocument();
        });
        
        expect(screen.getByText('@pinkylicious')).toBeInTheDocument();
        expect(screen.getByText('pinky@test.com')).toBeInTheDocument();
    });

    test('opens and closes edit profile form', async () => {
        setup();
        
        // Wait for component to load
        await waitFor(() => {
            expect(screen.getByRole('button', { name: /Edit Profile/i })).toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole('button', { name: /Edit Profile/i }));
        
        await waitFor(() => {
            expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
        });
        
        expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();

        fireEvent.click(screen.getByLabelText(/Close edit form/i));
        
        await waitFor(() => {
            expect(screen.queryByLabelText(/First Name/i)).not.toBeInTheDocument();
        });
    });

    test('populates edit form with current user data', async () => {
        setup();
        
        await waitFor(() => {
            expect(screen.getByRole('button', { name: /Edit Profile/i })).toBeInTheDocument();
        });
        
        fireEvent.click(screen.getByRole('button', { name: /Edit Profile/i }));

        await waitFor(() => {
            expect(screen.getByLabelText(/First Name/i)).toHaveValue(mockCurrentUser.name);
        });
        
        expect(screen.getByLabelText(/Last Name/i)).toHaveValue(mockCurrentUser.surname);
        expect(screen.getByLabelText(/Username/i)).toHaveValue(mockCurrentUser.username);
        expect(screen.getByLabelText(/Email/i)).toHaveValue(mockCurrentUser.email);
    });

    test('handles input changes in the edit form', async () => {
        setup();
        
        await waitFor(() => {
            expect(screen.getByRole('button', { name: /Edit Profile/i })).toBeInTheDocument();
        });
        
        fireEvent.click(screen.getByRole('button', { name: /Edit Profile/i }));

        const nameInput = await screen.findByLabelText(/First Name/i);
        fireEvent.change(nameInput, { target: { value: 'Angie' } });
        expect(nameInput).toHaveValue('Angie');
    });

    test('shows error if no changes are detected when saving', async () => {
        setup();
        
        await waitFor(() => {
            expect(screen.getByRole('button', { name: /Edit Profile/i })).toBeInTheDocument();
        });
        
        fireEvent.click(screen.getByRole('button', { name: /Edit Profile/i }));

        const saveButton = await screen.findByRole('button', { name: /Save Changes/i });
        fireEvent.click(saveButton);

        expect(await screen.findByText('No changes detected to save.')).toBeInTheDocument();
        expect(updateUserDetails).not.toHaveBeenCalled();
        expect(updateUserPassword).not.toHaveBeenCalled();
        expect(uploadUserAvatar).not.toHaveBeenCalled();
    });

    test('shows error if new passwords do not match', async () => {
        setup();
        
        await waitFor(() => {
            expect(screen.getByRole('button', { name: /Edit Profile/i })).toBeInTheDocument();
        });
        
        fireEvent.click(screen.getByRole('button', { name: /Edit Profile/i }));

        const newPasswordInput = await screen.findByLabelText('New Password');
        const confirmPasswordInput = screen.getByLabelText('Confirm New Password');
        
        fireEvent.change(newPasswordInput, { target: { value: 'newPassword123' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'differentPassword' } });
        
        fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));

        expect(await screen.findByText('Passwords do not match.')).toBeInTheDocument();
        expect(updateUserPassword).not.toHaveBeenCalled();
    });

    test('opens account deletion confirmation modal (step 1)', async () => {
        setup();
        
        await waitFor(() => {
            expect(screen.getByRole('button', { name: /Delete Account/i })).toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole('button', { name: /Delete Account/i }));
        
        expect(await screen.findByText(/Confirm Account Deletion/i)).toBeInTheDocument();
        expect(screen.getByText(/Deleting your account is a permanent action./i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Proceed/i })).toBeInTheDocument();
    });

    test('proceeds to final deletion confirmation step (step 2)', async () => {
        setup();
        
        await waitFor(() => {
            expect(screen.getByRole('button', { name: /Delete Account/i })).toBeInTheDocument();
        });
        
        fireEvent.click(screen.getByRole('button', { name: /Delete Account/i }));

        const proceedButton = await screen.findByRole('button', { name: /Proceed/i });
        fireEvent.click(proceedButton);
        
        expect(await screen.findByText(/Final Confirmation/i)).toBeInTheDocument();
        expect(screen.getByText(/To confirm deletion, please type "DELETE" into the box below./i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Type DELETE to confirm/i)).toBeInTheDocument();
    });

    test('cancels deletion from any step', async () => {
        setup();
        
        await waitFor(() => {
            expect(screen.getByRole('button', { name: /Delete Account/i })).toBeInTheDocument();
        });
        
        fireEvent.click(screen.getByRole('button', { name: /Delete Account/i }));
        
        await waitFor(() => {
            expect(screen.getByText(/Confirm Account Deletion/i)).toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
        
        await waitFor(() => {
            expect(screen.queryByText(/Confirm Account Deletion/i)).not.toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole('button', { name: /Delete Account/i }));
        
        const proceedButton = await screen.findByRole('button', { name: /Proceed/i });
        fireEvent.click(proceedButton);
        
        expect(await screen.findByText(/Final Confirmation/i)).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
        
        await waitFor(() => {
            expect(screen.queryByText(/Final Confirmation/i)).not.toBeInTheDocument();
        });
    });

    test('requires exact "DELETE" text for final confirmation', async () => {
        setup();
        
        await waitFor(() => {
            expect(screen.getByRole('button', { name: /Delete Account/i })).toBeInTheDocument();
        });
        
        fireEvent.click(screen.getByRole('button', { name: /Delete Account/i }));
        
        const proceedButton = await screen.findByRole('button', { name: /Proceed/i });
        fireEvent.click(proceedButton);

        const confirmInput = await screen.findByPlaceholderText(/Type DELETE to confirm/i);
        const deleteButtons = screen.getAllByRole('button', { name: /Delete Account/i });
        const finalDeleteButton = deleteButtons.find(button => button.className.includes('btn-danger'));
        
        expect(finalDeleteButton).toBeDisabled();

        fireEvent.change(confirmInput, { target: { value: 'delete' } });
        expect(finalDeleteButton).toBeDisabled();
        expect(deleteUserAccount).not.toHaveBeenCalled();

        fireEvent.change(confirmInput, { target: { value: 'DELET' } });
        expect(finalDeleteButton).toBeDisabled();
        expect(deleteUserAccount).not.toHaveBeenCalled();

        fireEvent.change(confirmInput, { target: { value: 'DELETE' } });
        expect(finalDeleteButton).toBeEnabled();
        fireEvent.click(finalDeleteButton);
        expect(deleteUserAccount).toHaveBeenCalled();
    });

    test('calls logout function when Log Out button is clicked', async () => {
        const mockLogout = jest.fn();
        setup({ logout: mockLogout });
        
        await waitFor(() => {
            expect(screen.getByRole('button', { name: /Log Out/i })).toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole('button', { name: /Log Out/i }));
        expect(mockLogout).toHaveBeenCalledTimes(1);
    });

    test('opens and displays the terms and conditions', async () => {
        setup();
        
        await waitFor(() => {
            expect(screen.getByRole('button', { name: /View Terms and Conditions/i })).toBeInTheDocument();
        });
        
        fireEvent.click(screen.getByRole('button', { name: /View Terms and Conditions/i }));

        const headings = await screen.findAllByText(/Terms and Conditions/i);
        expect(headings[0]).toBeInTheDocument();
        expect(screen.getByText(/1. Acceptance of Terms/i)).toBeInTheDocument();
        expect(screen.getByText(/2. Description of Service/i)).toBeInTheDocument();
    });
});
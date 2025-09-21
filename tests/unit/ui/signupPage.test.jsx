/**
 * @jest-environment jsdom
*/
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Signup } from '../../../frontend/src/pages/signup';
import '@testing-library/jest-dom';

const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

jest.mock('../../../frontend/src/contexts/authContext.js', () => ({
  useAuth: () => ({
    login: jest.fn(() => Promise.resolve()),
  }),
}));

jest.mock('../../../frontend/src/utils/apiCalls.js', () => ({
  signup: jest.fn(),
}));

import { signup } from '../../../frontend/src/utils/apiCalls.js';

describe('Signup Page', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        render(
            <MemoryRouter>
            <Signup />
            </MemoryRouter>
        );
    });

    it('renders all input fields', () => {
        expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Surname/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Terms and Conditions/i })).toBeInTheDocument();
    });

    it('shows error if form is submitted with empty fields', async () => {
        fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }));

        await waitFor(() => {
        expect(screen.getByText(/Please fill in all fields\./i)).toBeInTheDocument();
        });
    });

    it('shows error if password is weak', async () => {
        fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'John' } });
        fireEvent.change(screen.getByLabelText(/Surname/i), { target: { value: 'Doe' } });
        fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'johndoe' } });
        fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'john@example.com' } });
        fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'weakpass' } });
        fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: 'weakpass' } });
        fireEvent.click(screen.getByRole('checkbox', { name: /I agree to the/i }));
        fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }));

        await waitFor(() => {
        expect(
            screen.getByText(/Password must be at least 8 characters long and contain at least one special character\./i)
        ).toBeInTheDocument();
        });
    });

    it('shows error if passwords do not match', async () => {
        fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'Jane' } });
        fireEvent.change(screen.getByLabelText(/Surname/i), { target: { value: 'Doe' } });
        fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'janedoe' } });
        fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'jane@example.com' } });
        fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'Pass@1234' } });
        fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: 'Pass@4321' } });
        fireEvent.click(screen.getByRole('checkbox', { name: /I agree to the/i }));
        fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }));

        await waitFor(() => {
        expect(screen.getByText(/Passwords do not match\./i)).toBeInTheDocument();
        });
    });

    it('shows error if terms are not accepted', async () => {
        fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'John' } });
        fireEvent.change(screen.getByLabelText(/Surname/i), { target: { value: 'Doe' } });
        fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'johndoe' } });
        fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'john@example.com' } });
        fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'Pass@1234' } });
        fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: 'Pass@1234' } });
        
        fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }));

        await waitFor(() => {
        expect(screen.getByText(/You must accept the terms and conditions to sign up\./i)).toBeInTheDocument();
        });
    });

    // it('handles successful signup', async () => {
    //     signup.mockResolvedValueOnce({ user: { username: 'janedoe' } });

    //     fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'Jane' } });
    //     fireEvent.change(screen.getByLabelText(/Surname/i), { target: { value: 'Doe' } });
    //     fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'janedoe' } });
    //     fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'jane@example.com' } });
    //     fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'Pass@1234' } });
    //     fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: 'Pass@1234' } });
    //     fireEvent.click(screen.getByRole('checkbox', { name: /I agree to the/i }));
    //     fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }));

    //     await waitFor(() => {
    //     expect(screen.getByText(/Signup successful!/i)).toBeInTheDocument();
    //     });
    // });

    it('handles signup failure for existing email', async () => {
        signup.mockRejectedValueOnce(new Error('Email already exists'));

        fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'Jane' } });
        fireEvent.change(screen.getByLabelText(/Surname/i), { target: { value: 'Doe' } });
        fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'janedoe' } });
        fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'jane@example.com' } });
        fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'Pass@1234' } });
        fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: 'Pass@1234' } });
        fireEvent.click(screen.getByRole('checkbox', { name: /I agree to the/i }));
        fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }));

        await waitFor(() => {
        expect(screen.getByText(/Email already exists/i)).toBeInTheDocument();
        });
    });
});

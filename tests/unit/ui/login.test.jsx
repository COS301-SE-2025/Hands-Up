/**
 * @jest-environment jsdom
*/
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Login } from '../../../frontend/src/pages/login';
import '@testing-library/jest-dom';

const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const original = jest.requireActual('react-router-dom');
  return {
    __esModule: true,
    ...original,
    useNavigate: () => mockedNavigate,
  };
});

jest.mock('../../../frontend/src/hooks/learningStatsUpdater', () => ({
  useStatUpdater: () => jest.fn(),
}));

jest.mock('../../../frontend/src/contexts/authContext.js', () => ({
  useAuth: () => ({
    login: jest.fn(),
    resetPassword: jest.fn(),
    confirmPasswordReset: jest.fn(),
  }),
}));

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Storage.prototype.setItem = jest.fn();
  });

  function setup() {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
  }

  test('renders login form elements', () => {
    setup();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Log In/i })).toBeInTheDocument();
  });

  test('shows error when fields are empty', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: /Log In/i }));
    expect(screen.getByText(/Please enter both email and password/i)).toBeInTheDocument();
  });

  test('handles successful login', async () => {

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            user: { id: 1, name: 'Test User' },
          }),
      })
    );

    setup();

    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'password123' },
    });

    await waitFor(() =>
        expect(screen.getByRole('button', { name: /Log In/i })).not.toBeDisabled()
    );

    fireEvent.click(screen.getByRole('button', { name: /Log In/i }));

    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenCalledWith('/Home');
    });
  });

  test('shows error on failed login', async () => {

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'An unknown error occured' }),
      })
    );

    setup();

    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'wrong@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'wrongpass' },
    });

    await waitFor(() =>
        expect(screen.getByRole('button', { name: /Log In/i })).not.toBeDisabled()
    );

    fireEvent.click(screen.getByRole('button', { name: /Log In/i }));

    await waitFor(() => {
        expect(mockedNavigate).not.toHaveBeenCalled();
    });
  });
});

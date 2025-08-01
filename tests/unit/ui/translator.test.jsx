/**
 * @jest-environment jsdom
*/
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Translator } from '../../../frontend/src/pages/translator';
import '@testing-library/jest-dom';

Object.defineProperty(window, "speechSynthesis", {
    writable: true,
    value: {
      getVoices: jest.fn(() => [
        { name: "Microsoft Zira - English (United States)", lang: "en-US" },
      ]),
      speak: jest.fn(),
      cancel: jest.fn(),
    },
});

beforeEach(() => {
  jest.useFakeTimers();

  global.navigator.mediaDevices = {
    getUserMedia: jest.fn(() =>
      Promise.resolve({
        getTracks: () => [{ stop: jest.fn() }]
      })
    )
  };

  // Mock canvas
  HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
    drawImage: jest.fn()
  }));
  
  HTMLCanvasElement.prototype.toBlob = function (cb) {
    cb(new Blob(['fake-image'], { type: 'image/jpeg' }));
  };

  // Mock MediaRecorder
  global.MediaRecorder = class {
    constructor() {
      this.state = 'inactive';
      this.ondataavailable = null;
      this.onstop = null;
    }

    start() {
      this.state = 'recording';
      setTimeout(() => {
        if (this.ondataavailable) {
          this.ondataavailable({ data: new Blob(['video'], { type: 'video/webm' }) });
        }
      }, 100);
    }

    stop() {
      this.state = 'inactive';
      if (this.onstop) this.onstop();
    }
  };

  jest.useFakeTimers();
});

afterEach(() => {
  jest.clearAllMocks();
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

test('renders Translator component', async () => {
  render(<Translator />);
  expect(screen.getByText(/Sign Language Recognizer/i)).toBeInTheDocument();
});

// test('captures image and shows result', async () => {
//   render(<Translator />);
//   const captureButton = screen.getByRole('button', { name: /Capture Sign/i });

//   fireEvent.click(captureButton);
//   expect(screen.getByText(/Processing captured image/i)).toBeInTheDocument();

//   jest.advanceTimersByTime(1500); // simulate processing delay

//   await waitFor(() =>
//     expect(screen.getByText(/Detected: 'Hello'/)).toBeInTheDocument()
//   );
// });

// test('uploads an image and shows result', async () => {
//   render(<Translator />);

//   const file = new File(['dummy'], 'test.jpg', { type: 'image/jpeg' });
//   const input = screen.getByLabelText(/Upload Sign/i).querySelector('input');

//   fireEvent.change(input, { target: { files: [file] } });

//   expect(screen.getByText(/Processing uploaded image/i)).toBeInTheDocument();

//   jest.advanceTimersByTime(1500);

//   await waitFor(() =>
//     expect(screen.getByText(/Detected: 'Hello'/)).toBeInTheDocument()
//   );
// });

test('speak result disabled when nothing has been captured', async () => {
  render(<Translator />);

  const speakButton = screen.getByRole('button', { name: /volume up/i });
  expect(speakButton).toBeDisabled();
});

// test('speaks result when speak button clicked', async () => {
//   render(<Translator />);

//   const speakButton = screen.getByRole('button', { name: /volume up/i });
//   expect(speakButton).toBeDisabled();

//   fireEvent.click(screen.getByRole('button', { name: /record sequence/i }));
//   jest.advanceTimersByTime(1500);
//   await waitFor(() => expect(speakButton).not.toBeDisabled());

//   fireEvent.click(speakButton);
//   expect(window.speechSynthesis.speak).toHaveBeenCalled();
// });
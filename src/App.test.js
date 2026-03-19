import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Memora header', () => {
  render(<App />);
  expect(screen.getAllByText(/memora/i).length).toBeGreaterThan(0);
});

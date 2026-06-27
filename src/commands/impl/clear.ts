import { Command } from '../types';

// Special sentinel output — terminal checks for this value to clear history.
export const CLEAR_SENTINEL = '__CLEAR__';

export const clear: Command = {
  name: 'clear',
  description: 'Clear the terminal',
  usage: 'clear',
  execute() {
    return { output: CLEAR_SENTINEL };
  },
};

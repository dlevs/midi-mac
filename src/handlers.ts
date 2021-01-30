import brightness from 'brightness'
import execa from 'execa'
import loudness from 'loudness'
import parseMidiMessage from 'parse-midi'
import { promiseThrottle } from './util'

type MessageType = ReturnType<typeof parseMidiMessage>['messageType']

const setVolumeThrottled = promiseThrottle(loudness.setVolume)

export const handlers: {
  [messageType in MessageType]: {
    [key: number]: (message: { key: number; value: number }) => void
  }
} = {
  channelmodechange: {},
  channelpressure: {},
  controlchange: {
    5: ({ value }) => setVolumeThrottled((value / 127) * 100),
    6: ({ value }) => brightness.set(value / 127),
  },
  keypressure: {},
  noteoff: {},
  noteon: {
    62: () => execa('open', ['-a', 'Terminal']),
    64: () => execa('open', ['-a', 'Visual Studio Code']),
    65: () => execa('open', ['-a', 'Google Chrome']),
  },
  pitchbendchange: {},
  programchange: {},
  unknown: {},
}

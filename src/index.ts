import midi from 'midi'
import parseMidiMessage from 'parse-midi'
import loudness from 'loudness'
import brightness from 'brightness'
import execa from 'execa'
import { promiseThrottle } from './util'

const setVolumeThrottled = promiseThrottle(loudness.setVolume)

const handlers: {
  [messageType: string]: {
    [key: number]: (message: SimpleMessage) => any
  }
} = {
  controlchange: {
    5: ({ value }) => setVolumeThrottled((value / 127) * 100),
    6: ({ value }) => brightness.set(value / 127),
  },
  noteon: {
    62: () => execa('open', ['-a', 'Terminal']),
    64: () => execa('open', ['-a', 'Visual Studio Code']),
    65: () => execa('open', ['-a', 'Google Chrome']),
  },
}

function handleMidiMessage(deltaTime: number, message: Uint8Array) {
  const parsed = parseMidiMessage(message)
  const normalised =
    parsed.messageType === 'controlchange'
      ? {
          type: parsed.messageType,
          key: parsed.controlNumber,
          value: parsed.controlValue,
        }
      : parsed.messageType === 'noteon'
      ? {
          type: parsed.messageType,
          key: parsed.key,
          value: parsed.velocity,
        }
      : null

  if (normalised === null) {
    return
  }

  handlers[normalised.type]?.[normalised.key]?.(normalised)
}

new midi.Input().on('message', handleMidiMessage).openPort(0)

import _ from 'lodash'
import midi from 'midi'
import parseMidiMessage from 'parse-midi'
import loudness from 'loudness'
import brightness from 'brightness'
import execa from 'execa'

const THROTTLE_MS = 20

const handlers: {
  [messageType: string]: {
    [key: number]: (message: SimpleMessage) => any
  }
} = {
  controlchange: {
    5: (() => {
      let loudnessPromise: Promise<any> | null = null

      return async function setVolume({ value }: SimpleMessage) {
        if (!loudnessPromise) {
          loudnessPromise = loudness.setVolume((value / 127) * 100)
          await loudnessPromise
          loudnessPromise = null
        }
      }
    })(),
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

  console.log('MIDI message', parsed)

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

new midi.Input()
  .on('message', _.throttle(handleMidiMessage, THROTTLE_MS))
  .openPort(0)

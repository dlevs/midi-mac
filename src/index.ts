import midi from 'midi'
import parseMidiMessage from 'parse-midi'
import { handlers } from './handlers'

new midi.Input()
  .on(
    'message',
    function handleMidiMessage(deltaTime: number, message: Uint8Array) {
      const parsed = parseMidiMessage(message)
      // TODO: This is silly - the MIDI message is parsed, and then made generic again. Update `parse-midi` package.
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

      handlers[normalised.type][normalised.key]?.(normalised)
    }
  )
  .openPort(0)

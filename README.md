# MIDI-Mac

Control things on the mac with MIDI hardware.

## Setup

Install it, and start it in the background with pm2.

```sh
npm ci
npm install -g pm2
pm2 start npm --name "midi-mac" -- start
pm2 list
```

Then, run this to make it start up on boot.

```sh
pm2 startup
```

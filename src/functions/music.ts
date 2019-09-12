import * as TinyMusic from "../dependencies/TinyMusic";

var ac = new AudioContext();

// get the current Web Audio timestamp (this is when playback should begin)
let when = ac.currentTime,
  // set the tempo
  tempo = 150,
  // initialize some vars
  sequence1,
  sequence2,
  sequence3,
  // create an array of "note strings" that can be passed to a sequence
  lead = [
    "G3 e",
    "G#3 q",
    "A3 h",
    "- e",
    "G3 e",
    "G#3 q",
    "A3 h",
    "- e",
    "A3 e",
    "A#3 q",
    "B3 h",
    "- e",
    "A3 e",
    "A#3 q",
    "B3 h",
    "- e"
  ],
  harmony = ["-   e", "D4  e", "C4  e", "D4  e", "C3 e", "C4  e"],
  bass = [
    "D3  e",
    "-   e",
    "D3  e",
    "A2  e",
    "A2   e",
    "A2  e",
    "Bb2 e",
    "-   e",
    "Bb2 e"
  ];

// create 3 new sequences (one for lead, one for harmony, one for bass)
sequence1 = new TinyMusic.Sequence(ac, tempo, lead);
sequence2 = new TinyMusic.Sequence(ac, tempo, harmony);
sequence3 = new TinyMusic.Sequence(ac, tempo, bass);

// set staccato and smoothing values for maximum coolness
// sequence1.staccato = 0.6;
// sequence2.staccato = 0.6;
// sequence3.staccato = 0.5;
// sequence3.smoothing = 0.4;

// adjust the levels so the bass and harmony aren't too loud
// sequence1.gain.gain.value = 1.2 / 2;
// sequence2.gain.gain.value = 0.8 / 2;
// sequence3.gain.gain.value = 0.65 / 2;

// // apply EQ settings
// sequence1.mid.frequency.value = 800;
// sequence1.mid.gain.value = 3;
// sequence2.mid.frequency.value = 1200;
// sequence3.mid.gain.value = 3;
// sequence3.bass.gain.value = 2;
// sequence3.bass.frequency.value = 2080;
// sequence3.mid.gain.value = -6;
// sequence3.mid.frequency.value = 500;
// sequence3.treble.gain.value = -2;
// sequence3.treble.frequency.value = 1400;

export const playMusic = () => {
  stopMusic();
  // play
  when = ac.currentTime;
  //start the lead part immediately
  sequence1.play(when);
  // delay the harmony by 16 beats
  sequence2.play(when + (60 / tempo) * 6);
  // start the bass part immediately
  sequence3.play(when);
};

export const stopMusic = () => {
  // play
  when = ac.currentTime;
  //start the lead part immediately
  sequence1.stop();
  // delay the harmony by 16 beats
  sequence2.stop();
  // start the bass part immediately
  sequence3.stop();
};

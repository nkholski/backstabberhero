!(function(a, b) {
  "function" == typeof define && define.amd
    ? define(["exports"], b)
    : b(
        "object" == typeof exports && "string" != typeof exports.nodeName
          ? exports
          : (a.TinyMusic = {})
      );
})(this, function(a) {
  function b(a) {
    var c = a.split(h);
    (this.frequency = b.getFrequency(c[0]) || 0),
      (this.duration = b.getDuration(c[1]) || 0);
  }
  function c(a, b, c) {
    (this.ac = a || new AudioContext()),
      this.createFxNodes(),
      (this.tempo = b || 120),
      (this.loop = !0),
      (this.smoothing = 0),
      (this.staccato = 0),
      (this.notes = []),
      this.push.apply(this, c || []);
  }
  var d = "B#-C|C#-Db|D|D#-Eb|E-Fb|E#-F|F#-Gb|G|G#-Ab|A|A#-Bb|B-Cb",
    e = 440 * Math.pow(Math.pow(2, 1 / 12), -9),
    f = /^[0-9.]+$/,
    g = 4,
    h = /\s+/,
    i = /(\d+)/,
    j = {};
  d.split("|").forEach(function(a, b) {
    a.split("-").forEach(function(a) {
      j[a] = b;
    });
  }),
    (b.getFrequency = function(a) {
      var b = a.split(i),
        c = j[b[0]],
        d = (b[1] || g) - g,
        f = e * Math.pow(Math.pow(2, 1 / 12), c);
      return f * Math.pow(2, d);
    }),
    (b.getDuration = function(a) {
      return f.test(a)
        ? parseFloat(a)
        : a
            .toLowerCase()
            .split("")
            .reduce(function(a, b) {
              return (
                a +
                ("w" === b
                  ? 4
                  : "h" === b
                  ? 2
                  : "q" === b
                  ? 1
                  : "e" === b
                  ? 0.5
                  : "s" === b
                  ? 0.25
                  : 0)
              );
            }, 0);
    }),
    (c.prototype.createFxNodes = function() {
      var a = [["bass", 100], ["mid", 1e3], ["treble", 2500]],
        b = (this.gain = this.ac.createGain());
      return (
        a.forEach(
          function(a, c) {
            (c = this[a[0]] = this.ac.createBiquadFilter()),
              (c.type = "peaking"),
              (c.frequency.value = a[1]),
              b.connect((b = c));
          }.bind(this)
        ),
        b.connect(this.ac.destination),
        this
      );
    }),
    (c.prototype.push = function() {
      return (
        Array.prototype.forEach.call(
          arguments,
          function(a) {
            this.notes.push(a instanceof b ? a : new b(a));
          }.bind(this)
        ),
        this
      );
    }),
    (c.prototype.createCustomWave = function(a, b) {
      b || (b = a),
        (this.waveType = "custom"),
        (this.customWave = [new Float32Array(a), new Float32Array(b)]);
    }),
    (c.prototype.createOscillator = function() {
      return (
        this.stop(),
        (this.osc = this.ac.createOscillator()),
        this.customWave
          ? this.osc.setPeriodicWave(
              this.ac.createPeriodicWave.apply(this.ac, this.customWave)
            )
          : (this.osc.type = this.waveType || "square"),
        this.osc.connect(this.gain),
        this
      );
    }),
    (c.prototype.scheduleNote = function(a, b) {
      var c = (60 / this.tempo) * this.notes[a].duration,
        d = c * (1 - (this.staccato || 0));
      return (
        this.setFrequency(this.notes[a].frequency, b),
        this.smoothing && this.notes[a].frequency && this.slide(a, b, d),
        this.setFrequency(0, b + d),
        b + c
      );
    }),
    (c.prototype.getNextNote = function(a) {
      return this.notes[a < this.notes.length - 1 ? a + 1 : 0];
    }),
    (c.prototype.getSlideStartDelay = function(a) {
      return a - Math.min(a, (60 / this.tempo) * this.smoothing);
    }),
    (c.prototype.slide = function(a, b, c) {
      var d = this.getNextNote(a),
        e = this.getSlideStartDelay(c);
      return (
        this.setFrequency(this.notes[a].frequency, b + e),
        this.rampFrequency(d.frequency, b + c),
        this
      );
    }),
    (c.prototype.setFrequency = function(a, b) {
      return this.osc.frequency.setValueAtTime(a, b), this;
    }),
    (c.prototype.rampFrequency = function(a, b) {
      return this.osc.frequency.linearRampToValueAtTime(a, b), this;
    }),
    (c.prototype.play = function(a) {
      return (
        (a = "number" == typeof a ? a : this.ac.currentTime),
        this.createOscillator(),
        this.osc.start(a),
        this.notes.forEach(
          function(b, c) {
            a = this.scheduleNote(c, a);
          }.bind(this)
        ),
        this.osc.stop(a),
        (this.osc.onended = this.loop ? this.play.bind(this, a) : null),
        this
      );
    }),
    (c.prototype.stop = function() {
      return (
        this.osc &&
          ((this.osc.onended = null), this.osc.disconnect(), (this.osc = null)),
        this
      );
    }),
    (a.Note = b),
    (a.Sequence = c);
});
//# sourceMappingURL=tinymusic.min.js.map

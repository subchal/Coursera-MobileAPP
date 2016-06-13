var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

//
//  Audio Building Blocks
//

var VCO = (function(audioCtx) {
  function VCO() {
    this.oscillator = audioCtx.createOscillator();
    this.oscillator.type = 'sawtooth';
    this.setFrequency(440);
    this.oscillator.start(0);
    this.input = this.oscillator;
    this.output = this.oscillator;
    var self = this;
  }
  VCO.prototype.setFrequency = function(frequency) {
    this.oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
  };
  VCO.prototype.setType = function(type) {
    this.oscillator.type = type;
  };
  VCO.prototype.connect = function(node) {
    if(node.hasOwnProperty('input')) {
      this.output.connect(node.input);
    } else {
      this.output.connect(node);
    }
  };
  return VCO;
})(audioCtx);

var VCA = (function(audioCtx) {
  function VCA() {
    this.gain = audioCtx.createGain();
    this.gain.gain.value = 0;
    this.input = this.gain;
    this.output = this.gain;
    var self = this;
  }
  VCA.prototype.setGain = function(gain, time) {
    if(!time) {time = 0;}
    if( gain === 0.0 ) {gain = 0.0001;}
    if( gain > 1.0 ) {gain = 1;}
    this.gain.gain.linearRampToValueAtTime(gain,audioCtx.currentTime + 0.012 + time);
  };
  VCA.prototype.connect = function(node) {
    if(node.hasOwnProperty('input')){
      this.output.connect(node.input);
    } else {
      this.output.connect(node);
    }
  };
  return VCA;
})(audioCtx);

var PAN = (function(audioCtx) {
  function PAN() {
    this.panner = audioCtx.createStereoPanner();
    this.panner.pan.value = 0;
    this.input = this.panner;
    this.output = this.panner;
    var self = this;
  }

  PAN.prototype.setPosition = function(pan) {
    this.panner.pan.linearRampToValueAtTime(pan,audioCtx.currentTime + 0.012);
  };

  PAN.prototype.connect = function(node) {
    if(node.hasOwnProperty('input')){
      this.output.connect(node.input);
    } else {
      this.output.connect(node);
    }
  };

  return PAN;
})(audioCtx);

var FILTER = (function(audioCtx) {
  function FILTER() {
    this.filter = audioCtx.createBiquadFilter();
    this.filter.frequency.value = 22000;
    this.filter.type = "lowpass";
    this.filter.Q.value = 0.5;
    this.input = this.filter;
    this.output = this.filter;
    var self = this;
  }
  FILTER.prototype.setFreq = function(freq) {
    //if( freq === 0.0 ) {freq = 0.0001;}
    //if( freq > 1.0 ) {freq = 1;}
    this.filter.frequency.linearRampToValueAtTime(freq,audioCtx.currentTime + 0.012);
  };
  FILTER.prototype.connect = function(node) {
    if(node.hasOwnProperty('input')){
      this.output.connect(node.input);
    } else {
      this.output.connect(node);
    }
  };
  return FILTER;
})(audioCtx);

var DELAY = (function(audioCtx) {
  function DELAY() {
    this.delay = audioCtx.createDelay();
    this.delay.delayTime.value = 0.3;
    this.feedback = audioCtx.createGain();
    this.feedback.gain.value = 0.5;
    this.feedback.connect(this.delay);
    this.delay.connect(this.feedback);
    this.input = this.delay;
    this.output = this.delay;
    var self = this;
  }
  DELAY.prototype.setTime = function(delaytime) {
    this.delay.delayTime.linearRampToValueAtTime(delaytime,audioCtx.currentTime + 0.012);
  };
  DELAY.prototype.setFeedback = function(value) {
    this.feedback.gain.linearRampToValueAtTime(value,audioCtx.currentTime + 0.012);
  };
  DELAY.prototype.connect = function(node) {
    if(node.hasOwnProperty('input')){
      this.output.connect(node.input);
    } else {
      this.output.connect(node);
    }
  };
  return DELAY;
})(audioCtx);

var LFO = (function(audioCtx) {
  function LFO() {
    this.oscillator = audioCtx.createOscillator();
    this.gain = audioCtx.createGain();
    this.gain.gain.value = 3000;
    this.oscillator.type = 'sine';
    this.setFrequency(2);
    this.oscillator.start(0);

    this.oscillator.connect(this.gain);

    this.output = this.gain;

    var self = this;
  }
  LFO.prototype.setFrequency = function(frequency) {
    this.oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
  };
  LFO.prototype.connect = function(node) {
    if(node.hasOwnProperty('input')) {
      this.output.connect(node.input);
    } else {
      this.output.connect(node);
    }
  };
  LFO.prototype.modulateFreq = function(node) {
    //if(node.hasOwnProperty('frequency')) {
      this.output.connect(node.filter.frequency);
    //}
  };
  return LFO;
})(audioCtx);

var NoteValues = {
  init: function(rootNote) {
    this.root = rootNote;
    this.msecond = rootNote * Math.pow(Math.pow(2, 1/12), 1);
    this.second = rootNote * Math.pow(Math.pow(2, 1/12), 2);
    this.mthird = rootNote * Math.pow(Math.pow(2, 1/12), 3);
    this.third = rootNote * Math.pow(Math.pow(2, 1/12), 4);
    this.fourth = rootNote * Math.pow(Math.pow(2, 1/12), 5);
    this.mfifth = rootNote * Math.pow(Math.pow(2, 1/12), 6);
    this.fifth = rootNote * Math.pow(Math.pow(2, 1/12), 7);
    this.msixth = rootNote * Math.pow(Math.pow(2, 1/12), 8);
    this.sixth = rootNote * Math.pow(Math.pow(2, 1/12), 9);
    this.mseventh = rootNote * Math.pow(Math.pow(2, 1/12), 10);
    this.seventh = rootNote * Math.pow(Math.pow(2, 1/12), 11);
    this.octave = rootNote * Math.pow(Math.pow(2, 1/12), 12);

    this.notes = [this.root, this.msecond, this.second, this.mthird, this.third, this.fourth, this.mfifth, this.fifth, this.msixth, this.sixth, this.mseventh, this.seventh, this.octave];
  }

};

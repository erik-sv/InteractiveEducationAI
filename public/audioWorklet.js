class AudioResampler extends AudioWorkletProcessor {
  constructor() {
    super();
    this.lastSampleTime = 0;
  }

  process(inputs, outputs) {
    const input = inputs[0];
    const output = outputs[0];

    // Simple pass-through for now
    for (let channel = 0; channel < input.length; channel++) {
      output[channel].set(input[channel]);
    }

    return true;
  }
}

registerProcessor('audio-resampler', AudioResampler);

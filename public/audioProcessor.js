class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.volume = 0;
    this.smoothingFactor = 0.1; // Very low smoothing for minimal latency
    this.threshold = 0.005; // Lower threshold for better sensitivity
    this.processCounter = 0;
    this.updateRate = 2; // Update every 2 frames for minimal latency
  }

  process(inputs, outputs) {
    const input = inputs[0];
    if (!input || !input.length) return true;

    const samples = input[0];
    if (!samples) return true;

    // Fast RMS calculation
    let sum = 0;
    const step = 2; // Skip every other sample for performance
    for (let i = 0; i < samples.length; i += step) {
      sum += samples[i] * samples[i];
    }
    const rms = Math.sqrt(sum / (samples.length / step));

    // Minimal smoothing for faster response
    this.volume = this.smoothingFactor * rms + (1 - this.smoothingFactor) * this.volume;

    // Send message every updateRate frames if above threshold
    if (this.processCounter++ % this.updateRate === 0 && this.volume > this.threshold) {
      this.port.postMessage({
        type: 'volume',
        volume: this.volume
      });
    }

    return true;
  }
}

registerProcessor('audio-processor', AudioProcessor);

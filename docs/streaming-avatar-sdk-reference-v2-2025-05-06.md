# Streaming Avatar SDK API Reference

The [`@heygen/streaming-avatar`](https://github.com/HeyGen-Official/StreamingAvatarSDK) package provides a TypeScript SDK for interacting with HeyGen's streaming avatar service. For detailed information about the available methods, interfaces, enums, and event handling, refer to the API reference provided below.

## Classes

### `StreamingAvatar`
This class is the core of the SDK, responsible for managing avatar streaming sessions, including session creation, controlling avatars, and handling real-time communication.

**Constructor**
```typescript
constructor({ token, basePath }: StreamingAvatarApiConfig)
```

**Example**
```typescript
const avatar = new StreamingAvatar({ token: "access-token" });
```

## Interfaces

### `StreamingAvatarApiConfig`
Configuration object for initializing `StreamingAvatar`.
[Source](https://github.com/HeyGen-Official/StreamingAvatarSDK/blob/70d0e9073dfc842c01555a6450ad742f8303c446/src/index.ts)

| Property   | Type     | Description                                                                                                                                                              |
| :--------- | :------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `token`    | `string` | Authentication token for the session. **This is not your HeyGen API key.** Retrieve this 'Session Token' by calling the [create session token endpoint](https://docs.heygen.com/reference/create-session-token). |
| `basePath` | `string` | (Optional) Base API URL. Defaults to `https://api.heygen.com`.                                                                                                           |

**Example**
```typescript
const config: StreamingAvatarApiConfig = {
  token: "access-token", // Required
  basePath: "https://api.heygen.com" // Optional
};
```

### `StartAvatarRequest`
Request payload to initiate a new avatar streaming session.
[Source](https://github.com/HeyGen-Official/StreamingAvatarSDK/blob/70d0e9073dfc842c01555a6450ad742f8303c446/src/index.ts) | [API Details](https://docs.heygen.com/reference/new-session)

| Property             | Type            | Description                                                                                                                                                             |
| :------------------- | :-------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `avatarName`         | `string`        | Identifier for the avatar to be used (e.g., "default" or a specific avatar ID).                                                                                         |
| `quality`            | `AvatarQuality` | (Optional) The desired quality level of the avatar stream (`High`, `Medium`, `Low`).                                                                                    |
| `voice`              | `VoiceSetting`  | (Optional) [Voice settings](https://docs.heygen.com/reference/new-session#voicesetting) for the avatar (e.g., `voiceId`, `rate`, `emotion`).                               |
| `language`           | `string`        | (Optional) Specifies the language for the avatar's speech and understanding (e.g., "en-US").                                                                          |
| `knowledgeId`        | `string`        | (Optional) ID of a pre-configured knowledge base for the avatar. Retrieve from [labs.heygen.com](https://labs.heygen.com/interactive-avatar).                              |
| `knowledgeBase`      | `string`        | (Optional) Custom 'system prompt' for the LLM powering avatar responses when using `TaskType.TALK`.                                                                     |
| `disableIdleTimeout` | `boolean`       | (Optional) If `true`, prevents automatic session termination due to inactivity. **Caution:** Manage sessions carefully to avoid unintended credit consumption.           |

**`VoiceSetting` Structure (Example)**
```typescript
// Example structure for the 'voice' property in StartAvatarRequest
const voiceSetting = {
  voiceId: "your-voice-id", // Specific voice ID
  rate: 1.0, // Speech rate (0.5 to 1.5)
  emotion: VoiceEmotion.FRIENDLY // Desired voice emotion
};
```

**Example**
```typescript
const startRequest: StartAvatarRequest = {
  quality: AvatarQuality.High,
  avatarName: "avatarId", // Replace with your Avatar ID
  knowledgeId: "knowledgeId", // Optional: Replace with your Knowledge ID
  // knowledgeBase: "Custom system prompt here", // Optional
  voice: {
    voiceId: "voiceId", // Replace with your Voice ID
    rate: 1.5,      // Speech rate: 0.5 ~ 1.5
    emotion: VoiceEmotion.EXCITED,
  },
  language: "en-US", // Optional
  disableIdleTimeout: true // Optional
};
```

### `StartAvatarResponse`
The response received when an avatar session is successfully started.
[Source](https://github.com/HeyGen-Official/StreamingAvatarSDK/blob/70d0e9073dfc842c01555a6450ad742f8303c446/src/index.ts)

| Property                 | Type     | Description                                                     |
| :----------------------- | :------- | :-------------------------------------------------------------- |
| `session_id`             | `string` | Unique ID for the streaming session.                            |
| `access_token`           | `string` | Token for authenticating further interactions within the session. |
| `url`                    | `string` | WebSocket URL for the LiveKit streaming session.                |
| `is_paid`                | `boolean`| Indicates if the session is under a paid plan.                  |
| `session_duration_limit` | `number` | Maximum allowed duration for the session in seconds.            |

**Example Response**
```json
{
  "session_id": "eba59f0d-71f5-11ef-b8af-d2e5560124bc",
  "sdp": null,
  "access_token": "eyJhbGc...",
  "url": "wss://heygen-feapbkvq.livekit.cloud",
  "ice_servers": null,
  "ice_servers2": null,
  "is_paid": true,
  "session_duration_limit": 600
}
```

### `SpeakRequest`
Request payload for sending a speaking command to the avatar.
[Source](https://github.com/HeyGen-Official/StreamingAvatarSDK/blob/455b0b07e4357bb3516a8a1c4e9808dd86715a4c/src/index.ts) | [API Details](https://docs.heygen.com/reference/send-task)

| Property   | Type       | Description                                                                                               |
| :--------- | :--------- | :-------------------------------------------------------------------------------------------------------- |
| `text`     | `string`   | The text content for the avatar to speak.                                                                 |
| `taskType` | `TaskType` | Defines the speaking behavior: `TaskType.TALK` (LLM-driven) or `TaskType.REPEAT` (literal repetition).      |

**Example**
```typescript
const speakRequest: SpeakRequest = {
  text: "Hello, there!",
  taskType: TaskType.REPEAT // or TaskType.TALK
};
```

## Methods

### `createStartAvatar(requestData: StartAvatarRequest): Promise<any>`
Starts a new avatar session using the provided configuration and returns session information (typically `StartAvatarResponse`). This method handles the initial API call to create and start the session.

**Example**
```typescript
async function initializeSession() {
  const startRequest: StartAvatarRequest = { /* ... your config ... */ };
  try {
    const response = await avatar.createStartAvatar(startRequest);
    console.log("Session started:", response.session_id);
    // Store session_id and other relevant details from response
  } catch (error) {
    console.error("Error starting session:", error);
  }
}
```

### `startVoiceChat(requestData: { useSilencePrompt?: boolean } = {}): Promise<any>`
Starts a voice chat within the active avatar session. Allows enabling/disabling silence prompts.

| Parameter          | Type    | Description                                                                   |
| :----------------- | :------ | :---------------------------------------------------------------------------- |
| `useSilencePrompt` | `boolean` | (Optional) If `true`, enables automatic prompts during user silence. Default `false`. |

**Example**
```typescript
async function beginVoiceChat() {
  try {
    await avatar.startVoiceChat({ useSilencePrompt: false });
    console.log("Voice chat started.");
  } catch (error) {
    console.error("Error starting voice chat:", error);
  }
}
```

### `closeVoiceChat(): Promise<any>`
Ends the active voice chat session.

**Example**
```typescript
async function endVoiceChat() {
  try {
    await avatar.closeVoiceChat();
    console.log("Voice chat closed.");
  } catch (error) {
    console.error("Error closing voice chat:", error);
  }
}
```

### `newSession(requestData: StartAvatarRequest): Promise<StartAvatarResponse>`
Creates a new streaming session by calling the `/v1/streaming.new` endpoint and returns the session details, including `session_id` and LiveKit connection info. This method prepares a session but doesn't automatically connect to the media stream.

**Example**
```typescript
async function createNewSession() {
  const startRequest: StartAvatarRequest = { /* ... your config ... */ };
  try {
    const sessionData = await avatar.newSession(startRequest);
    console.log("New session created:", sessionData);
    // Use sessionData.session_id, sessionData.url, sessionData.access_token to connect manually or with startSession
  } catch (error) {
    console.error("Error creating new session:", error);
  }
}
```

### `startSession(): Promise<any>`
Connects to an existing avatar session that was previously created (e.g., using `newSession` or if session details are already available). It uses the internally stored session information (like URL and access token from `StartAvatarResponse`) to establish the LiveKit connection and media stream.

**Example**
```typescript
// Assuming newSession was called and its response stored internally by the SDK instance
async function connectToSession() {
  try {
    // Ensure newSession() or equivalent has provided session details to the avatar instance
    const response = await avatar.startSession();
    console.log("Session connected:", response);
    // Media stream should now be active if STREAM_READY event is handled
  } catch (error) {
    console.error("Error connecting to session:", error);
  }
}
```

### `speak(requestData: SpeakRequest): Promise<any>`
Sends a command for the avatar to speak the provided text, according to the specified `taskType`.

**Example**
```typescript
async function makeAvatarSpeak() {
  const speakRequest: SpeakRequest = { text: "Hello, world!", taskType: TaskType.REPEAT };
  try {
    await avatar.speak(speakRequest);
    console.log("Speak command sent.");
  } catch (error) {
    console.error("Error sending speak command:", error);
  }
}
```

### `startListening(): Promise<any>`
Activates the avatar’s listening mode, typically enabling microphone input for STT processing if configured.

**Example**
```typescript
async function enableListening() {
  try {
    await avatar.startListening();
    console.log("Avatar is now listening.");
  } catch (error) {
    console.error("Error starting listening:", error);
  }
}
```

### `stopListening(): Promise<any>`
Deactivates the avatar's listening mode.

**Example**
```typescript
async function disableListening() {
  try {
    await avatar.stopListening();
    console.log("Avatar has stopped listening.");
  } catch (error) {
    console.error("Error stopping listening:", error);
  }
}
```

### `interrupt(): Promise<any>`
Interrupts the avatar's current speaking task immediately.

**Example**
```typescript
async function interruptAvatar() {
  try {
    await avatar.interrupt();
    console.log("Avatar speech interrupted.");
  } catch (error) {
    console.error("Error interrupting avatar:", error);
  }
}
```

### `stopAvatar(): Promise<any>`
Stops the entire avatar streaming session and disconnects.

**Example**
```typescript
async function terminateSession() {
  try {
    await avatar.stopAvatar();
    console.log("Avatar session stopped.");
  } catch (error) {
    console.error("Error stopping avatar session:", error);
  }
}
```

### `on(eventType: StreamingEvents | string, listener: (data: any) => void): this`
Registers an event listener for a specific streaming event.

**Example**
```typescript
avatar.on(StreamingEvents.AVATAR_START_TALKING, (eventData) => {
  console.log("Avatar started talking:", eventData);
});
```

### `off(eventType: StreamingEvents | string, listener: (data: any) => void): this`
Unregisters an event listener for a specific streaming event.

**Example**
```typescript
const myListener = (eventData) => { console.log("Stream ready:", eventData); };
avatar.on(StreamingEvents.STREAM_READY, myListener);
// ...later
avatar.off(StreamingEvents.STREAM_READY, myListener);
```

## Types and Enums

### `AvatarQuality`
Defines the quality settings for the avatar stream.
[Source](https://github.com/HeyGen-Official/StreamingAvatarSDK/blob/70d0e9073dfc842c01555a6450ad742f8303c446/src/index.ts)

- `High`: `'high'` (Typically 2000kbps, 720p)
- `Medium`: `'medium'` (Typically 1000kbps, 480p)
- `Low`: `'low'` (Typically 500kbps, 360p)

### `VoiceEmotion`
Defines the emotional tone for the avatar's voice.
[Source](https://github.com/HeyGen-Official/StreamingAvatarSDK/blob/455b0b07e4357bb3516a8a1c4e9808dd86715a4c/src/index.ts)

- `EXCITED`
- `SERIOUS`
- `FRIENDLY`
- `SOOTHING`
- `BROADCASTER`

### `TaskType`
Defines the type of task for the avatar's speech generation.
[Source](https://github.com/HeyGen-Official/StreamingAvatarSDK/blob/455b0b07e4357bb3516a8a1c4e9808dd86715a4c/src/index.ts)

- `TALK`: Avatar processes the input text using an LLM (e.g., GPT-4o mini by default, influenced by `knowledgeId` or `knowledgeBase`) to generate a response.
- `REPEAT`: Avatar speaks the input text verbatim.

### `StreamingEvents`
Enumerates the event types emitted by the SDK during a streaming session.
[Source](https://github.com/HeyGen-Official/StreamingAvatarSDK/blob/70d0e9073dfc842c01555a6450ad742f8303c446/src/index.ts)

- `AVATAR_START_TALKING`: Emitted when the avatar begins speaking.
- `AVATAR_STOP_TALKING`: Emitted when the avatar finishes speaking.
- `AVATAR_TALKING_MESSAGE`: Fired when the avatar sends a message while talking (e.g., for real-time transcription).
- `AVATAR_END_MESSAGE`: Fired when the avatar sends the final message before ending its speech.
- `USER_TALKING_MESSAGE`: Emitted when the user sends a speaking message (requires STT integration).
- `USER_END_MESSAGE`: Triggered when the user finishes sending messages (requires STT integration).
- `USER_START`: Indicates when the user starts interacting/speaking (requires STT integration).
- `USER_STOP`: Indicates when the user stops interacting/speaking (requires STT integration).
- `USER_SILENCE`: Indicates when the user is silent for a defined period (requires STT integration).
- `STREAM_READY`: Fired when the avatar's media stream is ready and can be attached to a video element. The event data usually contains `event.detail` with the `MediaStream`.
- `STREAM_DISCONNECTED`: Triggered when the streaming connection is lost or intentionally disconnected.

## Event Handling
The SDK uses an event-driven architecture. Use the `on()` method to subscribe to events and `off()` to unsubscribe.

**Example: Handling `STREAM_READY`**
```typescript
avatar.on(StreamingEvents.STREAM_READY, (event) => {
  console.log('Stream is ready:', event.detail); // event.detail often contains the MediaStream
  const mediaStream = event.detail;
  const videoElement = document.getElementById('avatarVideo'); // Assuming you have a <video> element
  if (videoElement && mediaStream) {
    videoElement.srcObject = mediaStream;
    videoElement.play();
  }
});
```

**Example: Handling Avatar Speech Events**
```typescript
avatar.on(StreamingEvents.AVATAR_START_TALKING, () => {
  console.log('Avatar started speaking.');
});

avatar.on(StreamingEvents.AVATAR_TALKING_MESSAGE, (messageData) => {
  // `messageData` might contain the text being spoken if provided by the event
  console.log('Avatar is speaking:', messageData);
});

avatar.on(StreamingEvents.AVATAR_STOP_TALKING, () => {
  console.log('Avatar stopped speaking.');
});
```

## Error Handling
Wrap asynchronous SDK method calls in `try...catch` blocks to handle potential errors gracefully.

```typescript
try {
  await avatar.speak({ text: 'Hello!', taskType: TaskType.REPEAT });
} catch (error) {
  console.error('Error sending speak command:', error);
  // Implement UI feedback or retry logic
}
```

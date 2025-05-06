# Streaming Avatar SDK API Reference

Streaming Avatar SDK API Reference

[Suggest Edits](https://docs.heygen.com/edit/streaming-avatar-sdk-reference)

The [`@heygen/streaming-avatar`](https://github.com/HeyGen-Official/StreamingAvatarSDK) package provides a TypeScript SDK for interacting with HeyGen's streaming avatar service. For detailed information about the available methods, interfaces, enums, and event handling, refer to the API reference provided below.

# 

Classes

[](https://docs.heygen.com/docs/streaming-avatar-sdk-reference#classes)

### 

`StreamingAvatar`

[](https://docs.heygen.com/docs/streaming-avatar-sdk-reference#streamingavatar)

This class is the core of the SDK, responsible for managing avatar streaming sessions, including session creation, controlling avatars, and handling real-time communication.

TypeScriptTypeScript

```
<button aria-label="Copy Code" class="rdmd-code-copy fa"></button><code class="rdmd-code lang-typescript theme-light" data-lang="typescript" name="" tabindex="0"><div class="cm-s-neo" data-testid="SyntaxHighlighter"><span class="cm-keyword">const</span> <span class="cm-def">avatar</span> <span class="cm-operator">=</span> <span class="cm-keyword">new</span> <span class="cm-variable">StreamingAvatar</span>({ <span class="cm-property">token</span>: <span class="cm-string">"access-token"</span> });
</div></code>
```

# 

Interfaces

[](https://docs.heygen.com/docs/streaming-avatar-sdk-reference#interfaces)

### 

[`StreamingAvatarApiConfig`](https://github.com/HeyGen-Official/StreamingAvatarSDK/blob/70d0e9073dfc842c01555a6450ad742f8303c446/src/index.ts#L3-L6)

[](https://docs.heygen.com/docs/streaming-avatar-sdk-reference#streamingavatarapiconfig)

Configuration object for initializing `StreamingAvatar`.

| Property | Type | Description |
| --- | --- | --- |
| `token` | `string` | Authentication token for the session. **Please note this is not your HeyGen API key.** You can retrieve this 'Session Token' by calling the create\_token endpoint: [https://docs.heygen.com/reference/create-session-token](https://docs.heygen.com/reference/create-session-token) |
| `basePath` | `string` | Base API URL (optional, defaults to `https://api.heygen.com`). |

TypeScript

```
<button aria-label="Copy Code" class="rdmd-code-copy fa"></button><code class="rdmd-code lang-typescript theme-light" data-lang="typescript" name="" tabindex="0"><div class="cm-s-neo" data-testid="SyntaxHighlighter"><span class="cm-keyword">const</span> <span class="cm-def">config</span>: <span class="cm-type">StreamingAvatarApiConfig</span> <span class="cm-operator">=</span> {
  <span class="cm-property">token</span>: <span class="cm-string">"access-token"</span>,
};
</div></code>
```

### 

[`StartAvatarRequest`](https://github.com/HeyGen-Official/StreamingAvatarSDK/blob/70d0e9073dfc842c01555a6450ad742f8303c446/src/index.ts#L13-L18)[↗](https://docs.heygen.com/reference/new-session)

[](https://docs.heygen.com/docs/streaming-avatar-sdk-reference#startavatarrequest)

Request payload to initiate a new avatar streaming session.

| Property | Type | Description |
| --- | --- | --- |
| `avatarName` | `string` | Interactive Avatar ID for the session. (default, `default`) |
| `quality` | `AvatarQuality` | (Optional) The desired quality level of the avatar stream. |
| `voice` | `VoiceSetting` | (Optional) [Voice settings](https://docs.heygen.com/reference/new-session#voicesetting) for the avatar. |
| `knowledgeId` | `string` | (Optional) Knowledge base ID for the avatar's knowledge / prompt. Retrieve from [labs.heygen.com](https://labs.heygen.com/interactive-avatar). |
| `knowledgeBase` | `string` | (Optional) This is used as a custom 'system prompt' for the LLM that powers the Avatar's responses when using the Talk task type in the [Speak request](https://github.com/HeyGen-Official/StreamingAvatarSDK/blob/455b0b07e4357bb3516a8a1c4e9808dd86715a4c/src/index.ts#L47-L50) method. |
| `disableIdleTimeout` | `boolean` | (Optional) Controls the avatar's session timeout behavior. When true, prevents automatic session termination during periods of inactivity.  
_⚠️ Do not use this feature without proper session management, as open sessions can consume your API credits!_ |

TypeScript

```
<button aria-label="Copy Code" class="rdmd-code-copy fa"></button><code class="rdmd-code lang-typescript theme-light" data-lang="typescript" name="" tabindex="0"><div class="cm-s-neo" data-testid="SyntaxHighlighter"><span class="cm-keyword">const</span> <span class="cm-def">startRequest</span>: <span class="cm-type">StartAvatarRequest</span> <span class="cm-operator">=</span> {
  <span class="cm-property">quality</span>: <span class="cm-variable">AvatarQuality</span>.<span class="cm-property">High</span>,
  <span class="cm-property">avatarName</span>: <span class="cm-variable">avatarId</span>,
  <span class="cm-property">knowledgeId</span>: <span class="cm-variable">knowledgeId</span>,
  <span class="cm-comment">// knowledgeBase: knowledgeBase,</span>
  <span class="cm-property">voice</span>: {
    <span class="cm-property">voiceId</span>: <span class="cm-variable">voiceId</span>,
    <span class="cm-property">rate</span>: <span class="cm-number">1.5</span>, <span class="cm-comment">// 0.5 ~ 1.5</span>
    <span class="cm-property">emotion</span>: <span class="cm-variable">VoiceEmotion</span>.<span class="cm-property">EXCITED</span>,
  },
  <span class="cm-property">language</span>: <span class="cm-variable">language</span>,
  <span class="cm-property">disableIdleTimeout</span>: <span class="cm-atom">true</span>
};
</div></code>
```

### 

[`StartAvatarResponse`](https://github.com/HeyGen-Official/StreamingAvatarSDK/blob/70d0e9073dfc842c01555a6450ad742f8303c446/src/index.ts#L20-L26)

[](https://docs.heygen.com/docs/streaming-avatar-sdk-reference#startavatarresponse)

The response received when an avatar session is successfully started.

| Property | Type | Description |
| --- | --- | --- |
| `session_id` | `string` | The unique ID of the streaming session. |
| `access_token` | `string` | Token to authenticate further interactions. |
| `url` | `string` | WebSocket URL for establishing the streaming session. |
| `is_paid` | `boolean` | Indicates whether the session is under a paid plan. |
| `session_duration_limit` | `number` | Maximum allowed duration for the session in seconds. |

Response

```
<button aria-label="Copy Code" class="rdmd-code-copy fa"></button><code class="rdmd-code lang-json theme-light" data-lang="json" name="Response" tabindex="0"><div class="cm-s-neo" data-testid="SyntaxHighlighter">{
  <span class="cm-property">"session_id"</span>: <span class="cm-string">"eba59f0d-71f5-11ef-b8af-d2e5560124bc"</span>,
  <span class="cm-property">"sdp"</span>: <span class="cm-atom">null</span>,
  <span class="cm-property">"access_token"</span>: <span class="cm-string">"eyJhbGc..."</span>,
  <span class="cm-property">"url"</span>: <span class="cm-string">"wss://heygen-feapbkvq.livekit.cloud"</span>,
  <span class="cm-property">"ice_servers"</span>: <span class="cm-atom">null</span>,
  <span class="cm-property">"ice_servers2"</span>: <span class="cm-atom">null</span>,
  <span class="cm-property">"is_paid"</span>: <span class="cm-atom">true</span>,
  <span class="cm-property">"session_duration_limit"</span>: <span class="cm-number">600</span>
}
</div></code>
```

### 

[`SpeakRequest`](https://github.com/HeyGen-Official/StreamingAvatarSDK/blob/455b0b07e4357bb3516a8a1c4e9808dd86715a4c/src/index.ts#L47-L50)[↗](https://docs.heygen.com/reference/send-task)

[](https://docs.heygen.com/docs/streaming-avatar-sdk-reference#speakrequest)

Request payload for sending a speaking command to the avatar.

| Property | Type | Description |
| --- | --- | --- |
| `text` | `string` | The textual content the avatar will vocalize and synchronize with its movements. |
| `taskType` | `string` | Defines the speaking behavior mode. Options include TaskType.TALK and TaskType.REPEAT. |
| `taskMode` | `string` | Specifies synchronization strategy. `SYNC` blocks further actions until speaking completes, `ASYNC` allows concurrent processing. |

TypeScript

```
<button aria-label="Copy Code" class="rdmd-code-copy fa"></button><code class="rdmd-code lang-typescript theme-light" data-lang="typescript" name="" tabindex="0"><div class="cm-s-neo" data-testid="SyntaxHighlighter"><span class="cm-keyword">const</span> <span class="cm-def">speakRequest</span>: <span class="cm-type">SpeakRequest</span> <span class="cm-operator">=</span> {
  <span class="cm-property">text</span>: <span class="cm-string">"Hello, there!"</span>,
  <span class="cm-property">task_type</span>: <span class="cm-variable">TaskType</span>.<span class="cm-property">REPEAT</span>
};
</div></code>
```

# 

Methods

[](https://docs.heygen.com/docs/streaming-avatar-sdk-reference#methods)

### 

`createStartAvatar`

[](https://docs.heygen.com/docs/streaming-avatar-sdk-reference#createstartavatar)

Starts a new avatar session using the provided configuration and returns session information.

TypeScriptTypeScript

```
<button aria-label="Copy Code" class="rdmd-code-copy fa"></button><code class="rdmd-code lang-typescript theme-light" data-lang="typescript" name="" tabindex="0"><div class="cm-s-neo" data-testid="SyntaxHighlighter"><span class="cm-variable">createStartAvatar</span>(<span class="cm-variable">requestData</span>: <span class="cm-variable">StartAvatarRequest</span>): <span class="cm-variable">Promise</span><span class="cm-operator">&lt;</span><span class="cm-variable">any</span><span class="cm-operator">&gt;</span>
</div></code>
```

### 

`startVoiceChat`

[](https://docs.heygen.com/docs/streaming-avatar-sdk-reference#startvoicechat)

Starts a voice chat within the active avatar session. You can optionally enable or disable silence prompts during the chat by setting the `useSilencePrompt` flag

TypeScriptTypeScript

```
<button aria-label="Copy Code" class="rdmd-code-copy fa"></button><code class="rdmd-code lang-typescript theme-light" data-lang="typescript" name="" tabindex="0"><div class="cm-s-neo" data-testid="SyntaxHighlighter"><span class="cm-variable">startVoiceChat</span>(<span class="cm-variable">requestData</span>: { <span class="cm-variable">useSilencePrompt</span><span class="cm-operator">?</span>: <span class="cm-variable">boolean</span> } <span class="cm-operator">=</span> {}): <span class="cm-variable">Promise</span><span class="cm-operator">&lt;</span><span class="cm-variable">any</span><span class="cm-operator">&gt;</span>
</div></code>
```

| Property | Type | Description |
| --- | --- | --- |
| `useSilencePrompt` | `boolean` | (Optional) Controls automatic conversational prompts during periods of user inactivity. Enables fallback conversational strategies. |
| `isInputAudioMuted` | `boolean` | (Optional) Determines whether the user's microphone input is muted during the voice chat session. When set to `true`, the avatar will not receive audio input from the user. |

### 

`closeVoiceChat`

[](https://docs.heygen.com/docs/streaming-avatar-sdk-reference#closevoicechat)

Ends the active voice chat session within the avatar interaction.

TypeScriptTypeScript

```
<button aria-label="Copy Code" class="rdmd-code-copy fa"></button><code class="rdmd-code lang-typescript theme-light" data-lang="typescript" name="" tabindex="0"><div class="cm-s-neo" data-testid="SyntaxHighlighter"><span class="cm-variable">closeVoiceChat</span>(): <span class="cm-variable">Promise</span><span class="cm-operator">&lt;</span><span class="cm-variable">any</span><span class="cm-operator">&gt;</span>
</div></code>
```

### 

`newSession`

[](https://docs.heygen.com/docs/streaming-avatar-sdk-reference#newsession)

Creates and starts a new session using the provided `StartAvatarRequest` data, returning detailed session information such as the session ID and other metadata.

TypeScriptTypeScript

```
<button aria-label="Copy Code" class="rdmd-code-copy fa"></button><code class="rdmd-code lang-typescript theme-light" data-lang="typescript" name="" tabindex="0"><div class="cm-s-neo" data-testid="SyntaxHighlighter"><span class="cm-variable">newSession</span>(<span class="cm-variable">requestData</span>: <span class="cm-variable">StartAvatarRequest</span>): <span class="cm-variable">Promise</span><span class="cm-operator">&lt;</span><span class="cm-variable">StartAvatarResponse</span><span class="cm-operator">&gt;</span>
</div></code>
```

### 

`startSession`

[](https://docs.heygen.com/docs/streaming-avatar-sdk-reference#startsession)

Starts an existing avatar session by using the previously stored session ID or configuration from a `StartAvatarRequest`.

TypeScriptTypeScript

```
<button aria-label="Copy Code" class="rdmd-code-copy fa"></button><code class="rdmd-code lang-typescript theme-light" data-lang="typescript" name="" tabindex="0"><div class="cm-s-neo" data-testid="SyntaxHighlighter"><span class="cm-variable">startSession</span>(): <span class="cm-variable">Promise</span><span class="cm-operator">&lt;</span><span class="cm-variable">any</span><span class="cm-operator">&gt;</span>
</div></code>
```

### 

`speak`

[](https://docs.heygen.com/docs/streaming-avatar-sdk-reference#speak)

Sends a command to the avatar to speak the provided text. Additional parameters like `task_type` allow for more advanced control, like repeating or talking.

TypeScriptTypeScript

```
<button aria-label="Copy Code" class="rdmd-code-copy fa"></button><code class="rdmd-code lang-typescript theme-light" data-lang="typescript" name="" tabindex="0"><div class="cm-s-neo" data-testid="SyntaxHighlighter"><span class="cm-variable">speak</span>(<span class="cm-variable">requestData</span>: <span class="cm-variable">SpeakRequest</span>): <span class="cm-variable">Promise</span><span class="cm-operator">&lt;</span><span class="cm-variable">any</span><span class="cm-operator">&gt;</span>
</div></code>
```

### 

`startListening`

[](https://docs.heygen.com/docs/streaming-avatar-sdk-reference#startlistening)

Activates the avatar’s listening mode, allowing it to process incoming audio or messages from the user.

TypeScriptTypeScript

```
<button aria-label="Copy Code" class="rdmd-code-copy fa"></button><code class="rdmd-code lang-typescript theme-light" data-lang="typescript" name="" tabindex="0"><div class="cm-s-neo" data-testid="SyntaxHighlighter"><span class="cm-variable">startListening</span>(): <span class="cm-variable">Promise</span><span class="cm-operator">&lt;</span><span class="cm-variable">any</span><span class="cm-operator">&gt;</span>
</div></code>
```

### 

`stopListening`

[](https://docs.heygen.com/docs/streaming-avatar-sdk-reference#stoplistening)

Stops the avatar from listening to incoming audio or messages.

TypeScriptTypeScript

```
<button aria-label="Copy Code" class="rdmd-code-copy fa"></button><code class="rdmd-code lang-typescript theme-light" data-lang="typescript" name="" tabindex="0"><div class="cm-s-neo" data-testid="SyntaxHighlighter"><span class="cm-variable">stopListening</span>(): <span class="cm-variable">Promise</span><span class="cm-operator">&lt;</span><span class="cm-variable">any</span><span class="cm-operator">&gt;</span>
</div></code>
```

### 

`interrupt`

[](https://docs.heygen.com/docs/streaming-avatar-sdk-reference#interrupt)

Interrupts the current speaking task.

TypeScriptTypeScript

```
<button aria-label="Copy Code" class="rdmd-code-copy fa"></button><code class="rdmd-code lang-typescript theme-light" data-lang="typescript" name="" tabindex="0"><div class="cm-s-neo" data-testid="SyntaxHighlighter"><span class="cm-variable">interrupt</span>(): <span class="cm-variable">Promise</span><span class="cm-operator">&lt;</span><span class="cm-variable">any</span><span class="cm-operator">&gt;</span>
</div></code>
```

### 

`stopAvatar`

[](https://docs.heygen.com/docs/streaming-avatar-sdk-reference#stopavatar)

Stops the avatar session.

TypeScriptTypeScript

```
<button aria-label="Copy Code" class="rdmd-code-copy fa"></button><code class="rdmd-code lang-typescript theme-light" data-lang="typescript" name="" tabindex="0"><div class="cm-s-neo" data-testid="SyntaxHighlighter"><span class="cm-variable">stopAvatar</span>(): <span class="cm-variable">Promise</span><span class="cm-operator">&lt;</span><span class="cm-variable">any</span><span class="cm-operator">&gt;</span>
</div></code>
```

### 

`on`

[](https://docs.heygen.com/docs/streaming-avatar-sdk-reference#on)

Registers an event listener for specific streaming events.

TypeScriptTypeScript

```
<button aria-label="Copy Code" class="rdmd-code-copy fa"></button><code class="rdmd-code lang-typescript theme-light" data-lang="typescript" name="" tabindex="0"><div class="cm-s-neo" data-testid="SyntaxHighlighter"><span class="cm-variable">on</span>(<span class="cm-variable">eventType</span>: <span class="cm-variable">string</span>, <span class="cm-variable">listener</span>: <span class="cm-variable">EventHandler</span>): <span class="cm-keyword">this</span>
</div></code>
```

### 

off

[](https://docs.heygen.com/docs/streaming-avatar-sdk-reference#off)

Unregisters an event listener.

TypeScriptTypeScript

```
<button aria-label="Copy Code" class="rdmd-code-copy fa"></button><code class="rdmd-code lang-typescript theme-light" data-lang="typescript" name="" tabindex="0"><div class="cm-s-neo" data-testid="SyntaxHighlighter"><span class="cm-variable">off</span>(<span class="cm-variable">eventType</span>: <span class="cm-variable">string</span>, <span class="cm-variable">listener</span>: <span class="cm-variable">EventHandler</span>): <span class="cm-keyword">this</span>
</div></code>
```

# 

Types and Enums

[](https://docs.heygen.com/docs/streaming-avatar-sdk-reference#types-and-enums)

### 

[`AvatarQuality`](https://github.com/HeyGen-Official/StreamingAvatarSDK/blob/70d0e9073dfc842c01555a6450ad742f8303c446/src/index.ts#L8-L12)

[](https://docs.heygen.com/docs/streaming-avatar-sdk-reference#avatarquality)

Defines the quality settings for the avatar.

-   **High**: `'high'` - 2000kbps and 720p.
-   **Medium**: `'medium'` - 1000kbps and 480p.
-   **Low**: `'low'` - 500kbps and 360p.

### 

[`VoiceEmotion`](https://github.com/HeyGen-Official/StreamingAvatarSDK/blob/455b0b07e4357bb3516a8a1c4e9808dd86715a4c/src/index.ts#L15-L21)

[](https://docs.heygen.com/docs/streaming-avatar-sdk-reference#voiceemotion)

-   **`EXCITED`**: Excited voice emotion.
-   **`SERIOUS`**: Serious voice emotion.
-   **`FRIENDLY`**: Friendly voice emotion.
-   **`SOOTHING`**: Soothing voice emotion.
-   **`BROADCASTER`**: Broadcaster voice emotion.

### 

[`TaskType`](https://github.com/HeyGen-Official/StreamingAvatarSDK/blob/455b0b07e4357bb3516a8a1c4e9808dd86715a4c/src/index.ts#L43-L46)

[](https://docs.heygen.com/docs/streaming-avatar-sdk-reference#tasktype)

-   **`TALK`**: Avatar will talk in response to the `Text` sent in tasks of this type; the response will be provided by HeyGen's connection to GPT-4o mini, and influenced by the `KnowledgeID` or `KnowledgeBase`that were provided when calling the `StartAvatarRequest` method.
-   **`REPEAT`**: Avatar will simply repeat the `Text` sent in tasks of this type; this task type is commonly used by developers who process a user's input independently, via an LLM of their choosing, and send the LLM's response as a **Repeat** task for the Avatar to say.

### 

[`StreamingEvents`](https://github.com/HeyGen-Official/StreamingAvatarSDK/blob/70d0e9073dfc842c01555a6450ad742f8303c446/src/index.ts#L50-L61)

[](https://docs.heygen.com/docs/streaming-avatar-sdk-reference#streamingevents)

Enumerates the event types for streaming. See [Event Handling](https://docs.heygen.com/docs/streaming-avatar-sdk-reference#event-handling) for details.

-   **`AVATAR_START_TALKING`**: Emitted when the avatar starts speaking.
-   **`AVATAR_STOP_TALKING`**: Emitted when the avatar stops speaking.
-   **`AVATAR_TALKING_MESSAGE`**: Triggered when the avatar sends a speaking message.
-   **`AVATAR_END_MESSAGE`**: Triggered when the avatar finishes sending messages.
-   **`USER_TALKING_MESSAGE`**: Emitted when the user sends a speaking message.
-   **`USER_END_MESSAGE`**: Triggered when the user finishes sending messages.
-   **`USER_START`**: Indicates when the user starts interacting.
-   **`USER_STOP`**: Indicates when the user stops interacting.
-   **`USER_SILENCE`**: Indicates when the user is silent.
-   **`STREAM_READY`**: Indicates that the stream is ready for display.
-   **`STREAM_DISCONNECTED`**: Triggered when the stream disconnects.

# 

Event Handling

[](https://docs.heygen.com/docs/streaming-avatar-sdk-reference#event-handling)

The SDK emits a variety of events during a streaming session, which can be captured to update the UI or trigger additional logic. Use the `on` and `off` methods to manage event listeners.

### 

`AVATAR_START_TALKING`

[](https://docs.heygen.com/docs/streaming-avatar-sdk-reference#avatar_start_talking)

This event is emitted when the avatar begins speaking.

TypeScript

```
<button aria-label="Copy Code" class="rdmd-code-copy fa"></button><code class="rdmd-code lang-typescript theme-light" data-lang="typescript" name="" tabindex="0"><div class="cm-s-neo" data-testid="SyntaxHighlighter"><span class="cm-variable">avatar</span>.<span class="cm-property">on</span>(<span class="cm-variable">StreamingEvents</span>.<span class="cm-property">AVATAR_START_TALKING</span>, (<span class="cm-def">event</span>) <span class="cm-operator">=&gt;</span> {
  <span class="cm-variable">console</span>.<span class="cm-property">log</span>(<span class="cm-string">'Avatar has started talking:'</span>, <span class="cm-variable-2">event</span>);
  <span class="cm-comment">// You can update the UI to reflect that the avatar is talking</span>
});
</div></code>
```

### 

`AVATAR_STOP_TALKING`

[](https://docs.heygen.com/docs/streaming-avatar-sdk-reference#avatar_stop_talking)

TypeScript

```
<button aria-label="Copy Code" class="rdmd-code-copy fa"></button><code class="rdmd-code lang-typescript theme-light" data-lang="typescript" name="" tabindex="0"><div class="cm-s-neo" data-testid="SyntaxHighlighter"><span class="cm-variable">avatar</span>.<span class="cm-property">on</span>(<span class="cm-variable">StreamingEvents</span>.<span class="cm-property">AVATAR_STOP_TALKING</span>, (<span class="cm-def">event</span>) <span class="cm-operator">=&gt;</span> {
  <span class="cm-variable">console</span>.<span class="cm-property">log</span>(<span class="cm-string">'Avatar has stopped talking:'</span>, <span class="cm-variable-2">event</span>);
  <span class="cm-comment">// You can reset the UI to indicate the avatar has stopped speaking</span>
});
</div></code>
```

### 

`AVATAR_TALKING_MESSAGE`

[](https://docs.heygen.com/docs/streaming-avatar-sdk-reference#avatar_talking_message)

Fired when the avatar sends a message while talking. This event can be useful for real-time updates on what the avatar is currently saying.

TypeScript

```
<button aria-label="Copy Code" class="rdmd-code-copy fa"></button><code class="rdmd-code lang-typescript theme-light" data-lang="typescript" name="" tabindex="0"><div class="cm-s-neo" data-testid="SyntaxHighlighter"><span class="cm-variable">avatar</span>.<span class="cm-property">on</span>(<span class="cm-variable">StreamingEvents</span>.<span class="cm-property">AVATAR_TALKING_MESSAGE</span>, (<span class="cm-def">message</span>) <span class="cm-operator">=&gt;</span> {
  <span class="cm-variable">console</span>.<span class="cm-property">log</span>(<span class="cm-string">'Avatar talking message:'</span>, <span class="cm-variable-2">message</span>);
  <span class="cm-comment">// You can display the message in the UI</span>
});
</div></code>
```

### 

`AVATAR_END_MESSAGE`

[](https://docs.heygen.com/docs/streaming-avatar-sdk-reference#avatar_end_message)

Fired when the avatar sends the final message before ending its speech.

TypeScript

```
<button aria-label="Copy Code" class="rdmd-code-copy fa"></button><code class="rdmd-code lang-typescript theme-light" data-lang="typescript" name="" tabindex="0"><div class="cm-s-neo" data-testid="SyntaxHighlighter"><span class="cm-variable">avatar</span>.<span class="cm-property">on</span>(<span class="cm-variable">StreamingEvents</span>.<span class="cm-property">AVATAR_END_MESSAGE</span>, (<span class="cm-def">message</span>) <span class="cm-operator">=&gt;</span> {
  <span class="cm-variable">console</span>.<span class="cm-property">log</span>(<span class="cm-string">'Avatar end message:'</span>, <span class="cm-variable-2">message</span>);
  <span class="cm-comment">// Handle the end of the avatar's message, e.g., indicate the end of the conversation</span>
});
</div></code>
```

### 

`USER_TALKING_MESSAGE`

[](https://docs.heygen.com/docs/streaming-avatar-sdk-reference#user_talking_message)

Fired when the user sends a message to the avatar.

TypeScript

```
<button aria-label="Copy Code" class="rdmd-code-copy fa"></button><code class="rdmd-code lang-typescript theme-light" data-lang="typescript" name="" tabindex="0"><div class="cm-s-neo" data-testid="SyntaxHighlighter"><span class="cm-variable">avatar</span>.<span class="cm-property">on</span>(<span class="cm-variable">StreamingEvents</span>.<span class="cm-property">USER_TALKING_MESSAGE</span>, (<span class="cm-def">message</span>) <span class="cm-operator">=&gt;</span> {
  <span class="cm-variable">console</span>.<span class="cm-property">log</span>(<span class="cm-string">'User talking message:'</span>, <span class="cm-variable-2">message</span>);
  <span class="cm-comment">// Handle the user's message input to the avatar</span>
});
</div></code>
```

### 

`USER_END_MESSAGE`

[](https://docs.heygen.com/docs/streaming-avatar-sdk-reference#user_end_message)

Fired when the user has finished sending their message to the avatar.

TypeScript

```
<button aria-label="Copy Code" class="rdmd-code-copy fa"></button><code class="rdmd-code lang-typescript theme-light" data-lang="typescript" name="" tabindex="0"><div class="cm-s-neo" data-testid="SyntaxHighlighter"><span class="cm-variable">avatar</span>.<span class="cm-property">on</span>(<span class="cm-variable">StreamingEvents</span>.<span class="cm-property">USER_END_MESSAGE</span>, (<span class="cm-def">message</span>) <span class="cm-operator">=&gt;</span> {
  <span class="cm-variable">console</span>.<span class="cm-property">log</span>(<span class="cm-string">'User end message:'</span>, <span class="cm-variable-2">message</span>);
  <span class="cm-comment">// Handle the end of the user's message, e.g., process the user's response</span>
});
</div></code>
```

### 

`USER_START`

[](https://docs.heygen.com/docs/streaming-avatar-sdk-reference#user_start)

Fired when the user has finished sending their message to the avatar.

TypeScript

```
<button aria-label="Copy Code" class="rdmd-code-copy fa"></button><code class="rdmd-code lang-typescript theme-light" data-lang="typescript" name="" tabindex="0"><div class="cm-s-neo" data-testid="SyntaxHighlighter"><span class="cm-variable">avatar</span>.<span class="cm-property">on</span>(<span class="cm-variable">StreamingEvents</span>.<span class="cm-property">USER_START</span>, (<span class="cm-def">event</span>) <span class="cm-operator">=&gt;</span> {
  <span class="cm-variable">console</span>.<span class="cm-property">log</span>(<span class="cm-string">'User has started interaction:'</span>, <span class="cm-variable-2">event</span>);
  <span class="cm-comment">// Handle the start of the user's interaction, such as activating a listening indicator</span>
});
</div></code>
```

### 

`USER_STOP`

[](https://docs.heygen.com/docs/streaming-avatar-sdk-reference#user_stop)

Triggered when the user stops interacting or speaking with the avatar.

TypeScript

```
<button aria-label="Copy Code" class="rdmd-code-copy fa"></button><code class="rdmd-code lang-typescript theme-light" data-lang="typescript" name="" tabindex="0"><div class="cm-s-neo" data-testid="SyntaxHighlighter"><span class="cm-variable">avatar</span>.<span class="cm-property">on</span>(<span class="cm-variable">StreamingEvents</span>.<span class="cm-property">USER_STOP</span>, (<span class="cm-def">event</span>) <span class="cm-operator">=&gt;</span> {
  <span class="cm-variable">console</span>.<span class="cm-property">log</span>(<span class="cm-string">'User has stopped interaction:'</span>, <span class="cm-variable-2">event</span>);
  <span class="cm-comment">// Handle the end of the user's interaction, such as deactivating a listening indicator</span>
});
</div></code>
```

### 

`USER_SILENCE`

[](https://docs.heygen.com/docs/streaming-avatar-sdk-reference#user_silence)

Triggered when the user is silent for a certain period.

TypeScript

```
<button aria-label="Copy Code" class="rdmd-code-copy fa"></button><code class="rdmd-code lang-typescript theme-light" data-lang="typescript" name="" tabindex="0"><div class="cm-s-neo" data-testid="SyntaxHighlighter"><span class="cm-variable">avatar</span>.<span class="cm-property">on</span>(<span class="cm-variable">StreamingEvents</span>.<span class="cm-property">USER_SILENCE</span>, () <span class="cm-operator">=&gt;</span> {
  <span class="cm-variable">console</span>.<span class="cm-property">log</span>(<span class="cm-string">'User is silent'</span>);
});
</div></code>
```

### 

`STREAM_READY`

[](https://docs.heygen.com/docs/streaming-avatar-sdk-reference#stream_ready)

Fired when the avatar's streaming session is ready.

TypeScript

```
<button aria-label="Copy Code" class="rdmd-code-copy fa"></button><code class="rdmd-code lang-typescript theme-light" data-lang="typescript" name="" tabindex="0"><div class="cm-s-neo" data-testid="SyntaxHighlighter"><span class="cm-variable">avatar</span>.<span class="cm-property">on</span>(<span class="cm-variable">StreamingEvents</span>.<span class="cm-property">STREAM_READY</span>, (<span class="cm-def">event</span>) <span class="cm-operator">=&gt;</span> {
  <span class="cm-variable">console</span>.<span class="cm-property">log</span>(<span class="cm-string">'Stream is ready:'</span>, <span class="cm-variable-2">event</span>.<span class="cm-property">detail</span>);
  <span class="cm-comment">// Use event.detail to attach the media stream to a video element, for example</span>
});
</div></code>
```

### 

`STREAM_DISCONNECTED`

[](https://docs.heygen.com/docs/streaming-avatar-sdk-reference#stream_disconnected)

Triggered when the streaming connection is lost or intentionally disconnected.

TypeScript

```
<button aria-label="Copy Code" class="rdmd-code-copy fa"></button><code class="rdmd-code lang-typescript theme-light" data-lang="typescript" name="" tabindex="0"><div class="cm-s-neo" data-testid="SyntaxHighlighter"><span class="cm-variable">avatar</span>.<span class="cm-property">on</span>(<span class="cm-variable">StreamingEvents</span>.<span class="cm-property">STREAM_DISCONNECTED</span>, () <span class="cm-operator">=&gt;</span> {
  <span class="cm-variable">console</span>.<span class="cm-property">log</span>(<span class="cm-string">'Stream has been disconnected'</span>);
  <span class="cm-comment">// Handle the disconnection, e.g., clean up the UI or try to reconnect the session</span>
});
</div></code>
```

# 

Error Handling

[](https://docs.heygen.com/docs/streaming-avatar-sdk-reference#error-handling)

Always handle errors gracefully when dealing with asynchronous requests to avoid disruptions in the user experience.

TypeScript

```
<button aria-label="Copy Code" class="rdmd-code-copy fa"></button><code class="rdmd-code lang-typescript theme-light" data-lang="typescript" name="" tabindex="0"><div class="cm-s-neo" data-testid="SyntaxHighlighter"><span class="cm-keyword">try</span> {
  <span class="cm-keyword">await</span> <span class="cm-variable">avatar</span>.<span class="cm-property">speak</span>({ <span class="cm-property">text</span>: <span class="cm-string">'Hello!'</span> });
} <span class="cm-keyword">catch</span> (<span class="cm-def">error</span>) {
  <span class="cm-variable">console</span>.<span class="cm-property">error</span>(<span class="cm-string">'Error sending speak command:'</span>, <span class="cm-variable-2">error</span>);
}
</div></code>
```

# 

Conclusion

[](https://docs.heygen.com/docs/streaming-avatar-sdk-reference#conclusion)

This reference offers a comprehensive overview of HeyGen's streaming avatar SDK, complete with examples and descriptions of methods, events, and configuration options.
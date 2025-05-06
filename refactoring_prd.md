# Refactoring Plan: InteractiveAvatar Component

**Goal:** Improve the maintainability, testability, and readability of the `InteractiveAvatar.tsx` component by separating concerns and potentially creating custom hooks or smaller sub-components.

**Current State:**
`InteractiveAvatar.tsx` currently handles:
- State management (connection, transcription, mic status, session status, etc.)
- API calls (start/stop session, save transcription, send audio)
- HeyGen SDK integration and event handling
- Whisper.cpp integration (`useWhisper`) and microphone handling
- UI rendering and layout
- Utility functions (timestamps, saving files)

**Proposed Refactoring Areas:**

1.  **Custom Hook for HeyGen Session Management (`useHeyGenAvatar`)**
    *   Encapsulate `avatar.current` instance.
    *   Manage connection state (`connectionState`).
    *   Handle HeyGen SDK event listeners (`StreamingEvents`).
    *   Expose methods: `startSession`, `stopSession`, `sendText`, `sendAudio`.
    *   Manage session info (`streamId`, `sessionFilename`).

2.  **Custom Hook for Transcription (`useTranscriptionManager`)**
    *   Manage `transcription` and `transcriptionHistory` states.
    *   Handle combining partial/full transcripts.
    *   Encapsulate logic for saving transcripts (`saveTranscriptionToFile`).
    *   Provide functions to add entries (`addUserEntry`, `addAvatarEntry`, `addSystemEntry`).

3.  **Custom Hook for Microphone/Whisper (`useWhisperInput`)**
    *   Wrap the `useWhisper` hook.
    *   Manage microphone state (`isMicMuted`, recording status).
    *   Handle `onMicrophoneData` and potentially debouncing/buffering.
    *   Expose processed audio data or trigger callbacks (e.g., `onUserAudioChunk`).

4.  **Separate UI Components:**
    *   `AvatarDisplay`: Component specifically for rendering the `<video>` or loading state.
    *   `ControlPanel`: Component for buttons (Start/Stop, Mute, Settings).
    *   `ChatInterface`: Could potentially wrap `ChatHistory` and input methods if needed.

**Benefits:**
- **Improved Readability:** `InteractiveAvatar.tsx` becomes primarily an orchestrator.
- **Easier Testing:** Hooks and smaller components can be tested in isolation.
- **Reusability:** Hooks might be reusable in other contexts.
- **Clearer Separation of Concerns:** Reduces complexity within a single file.

**Next Steps:**
- Review this plan.
- Prioritize which refactoring steps to implement first (e.g., starting with `useHeyGenAvatar`).
- Implement changes incrementally, ensuring functionality at each step.

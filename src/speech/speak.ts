import { findSavedVoice } from "./voices";

let currentUtterance: SpeechSynthesisUtterance | null = null;

export function speakPhrase(text: string) {
  if (!("speechSynthesis" in window)) {
    alert("Speech is not supported in this browser.");
    return;
  }

  // Stop only if something is currently speaking
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
  }

  // Add punctuation to help the synthesizer finish the final sound
  const spokenText = text.trim().replace(/\s+$/, "") + ".";

  const utterance = new SpeechSynthesisUtterance(spokenText);

  utterance.rate = 0.9;
  utterance.pitch = 1;
  utterance.volume = 1;

  const selectedVoice = findSavedVoice();

  if (selectedVoice) {
    utterance.voice = selectedVoice;
    utterance.lang = selectedVoice.lang;
  }

  currentUtterance = utterance;

  window.speechSynthesis.speak(utterance);
}

const VOICE_PREFERENCE_KEY = "simplespeech.voicePreference";

export type VoicePreference = {
  voiceURI: string;
  name: string;
  lang: string;
};

export function isSpeechSupported() {
  return "speechSynthesis" in window;
}

export function getAvailableVoices() {
  if (!isSpeechSupported()) {
    return [];
  }

  return window.speechSynthesis.getVoices();
}

export function getSavedVoicePreference(): VoicePreference | null {
  try {
    const rawPreference = localStorage.getItem(VOICE_PREFERENCE_KEY);

    if (!rawPreference) {
      return null;
    }

    const preference = JSON.parse(rawPreference) as Partial<VoicePreference>;

    if (
      typeof preference.voiceURI === "string" &&
      typeof preference.name === "string" &&
      typeof preference.lang === "string"
    ) {
      return {
        voiceURI: preference.voiceURI,
        name: preference.name,
        lang: preference.lang
      };
    }
  } catch {
    localStorage.removeItem(VOICE_PREFERENCE_KEY);
  }

  return null;
}

export function saveVoicePreference(voice: SpeechSynthesisVoice | null) {
  if (!voice) {
    localStorage.removeItem(VOICE_PREFERENCE_KEY);
    return;
  }

  const preference: VoicePreference = {
    voiceURI: voice.voiceURI,
    name: voice.name,
    lang: voice.lang
  };

  localStorage.setItem(VOICE_PREFERENCE_KEY, JSON.stringify(preference));
}

export function findSavedVoice(voices = getAvailableVoices()) {
  const preference = getSavedVoicePreference();

  if (!preference) {
    return null;
  }

  return (
    voices.find((voice) => voice.voiceURI === preference.voiceURI) ??
    voices.find((voice) => voice.name === preference.name && voice.lang === preference.lang) ??
    null
  );
}

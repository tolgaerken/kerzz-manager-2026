/**
 * Web Audio API ile bildirim sesi üretir.
 * Harici ses dosyası gerektirmez.
 *
 * Safari uyumluluğu:
 * - webkitAudioContext fallback
 * - AudioContext kullanıcı etkileşiminde başlatılır (warmup)
 * - resume() async olarak beklenir
 */

// Safari eski prefix desteği
const AudioContextClass =
  window.AudioContext ??
  (window as unknown as { webkitAudioContext: typeof AudioContext })
    .webkitAudioContext;

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext && AudioContextClass) {
    audioContext = new AudioContextClass();
  }
  if (!audioContext) {
    throw new Error("AudioContext desteklenmiyor");
  }
  return audioContext;
}

/**
 * AudioContext'i kullanıcı etkileşimi sırasında başlatır.
 * Safari, AudioContext'in user gesture içinde oluşturulmasını/resume edilmesini gerektirir.
 * Bu fonksiyon toggle butonuna tıklandığında çağrılmalıdır.
 */
export async function warmupAudioContext(): Promise<void> {
  try {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") {
      await ctx.resume();
    }

    // Safari'de AudioContext'i "unlock" etmek için sessiz bir buffer çal
    const buffer = ctx.createBuffer(1, 1, ctx.sampleRate);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
  } catch {
    // Sessizce devam et
  }
}

/**
 * Bildirim sesi çalar (kısa "ding" tonu).
 *
 * AudioContext daha önce warmupAudioContext() ile başlatılmış olmalıdır.
 * Aksi halde Safari'de ses çıkmayabilir.
 */
export async function playNotificationSound(): Promise<void> {
  try {
    const ctx = getAudioContext();

    // AudioContext suspended ise resume et (async)
    if (ctx.state === "suspended") {
      await ctx.resume();
    }

    const now = ctx.currentTime;

    // Ana ton (hoş bir "ding")
    const oscillator = ctx.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, now); // A5 notası
    oscillator.frequency.exponentialRampToValueAtTime(440, now + 0.15);

    // Gain (ses seviyesi) - yumuşak başlayıp sönen
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.02); // Hızlı yükseliş
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.5); // Yavaş sönme

    // İkinci harmonik (zenginlik için)
    const oscillator2 = ctx.createOscillator();
    oscillator2.type = "sine";
    oscillator2.frequency.setValueAtTime(1320, now); // E6
    oscillator2.frequency.exponentialRampToValueAtTime(660, now + 0.1);

    const gainNode2 = ctx.createGain();
    gainNode2.gain.setValueAtTime(0, now);
    gainNode2.gain.linearRampToValueAtTime(0.1, now + 0.02);
    gainNode2.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    // Bağlantılar
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator2.connect(gainNode2);
    gainNode2.connect(ctx.destination);

    // Çal ve durdur
    oscillator.start(now);
    oscillator.stop(now + 0.5);

    oscillator2.start(now);
    oscillator2.stop(now + 0.3);
  } catch {
    // Ses çalınamazsa sessizce devam et
    console.warn("Bildirim sesi çalınamadı");
  }
}

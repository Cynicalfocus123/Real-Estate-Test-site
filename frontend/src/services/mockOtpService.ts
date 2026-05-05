const OTP_STORAGE_KEY = "bhfl:mock-otp-challenges-v1";
const OTP_TTL_MS = 5 * 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;

export const DEV_ONLY_MOCK_PHONE_NUMBER = "+15550001111";
export const DEV_ONLY_MOCK_OTP_CODE = "246810";

type OtpPurpose = "login" | "signup";

type StoredOtpChallenge = {
  challengeId: string;
  phoneNumber: string;
  purpose: OtpPurpose;
  codeHash: string;
  expiresAt: number;
  attemptsRemaining: number;
};

type OtpChallengeMap = Record<string, StoredOtpChallenge>;

type OtpResult =
  | { ok: true; challengeId: string; expiresAt: number; devMessage: string }
  | { ok: false; error: string };

function sanitizePhone(value: string) {
  return value.replace(/[^\d+]/g, "");
}

export function isValidOtpPhoneNumber(value: string) {
  const normalized = sanitizePhone(value);
  const digits = normalized.replace(/\D/g, "");
  return /^\+?\d{7,15}$/.test(normalized) && digits.length >= 7 && digits.length <= 15;
}

export function sanitizeOtpCode(value: string) {
  return value.replace(/[^\d]/g, "").slice(0, 6);
}

export function isValidOtpCode(value: string) {
  return /^\d{6}$/.test(value);
}

function createChallengeId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `otp-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

async function hashOtpCode(code: string) {
  if (typeof crypto === "undefined" || !crypto.subtle) {
    return "";
  }
  const buffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(code));
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function getStoredChallenges() {
  try {
    const raw = window.sessionStorage.getItem(OTP_STORAGE_KEY);
    if (!raw) return {} satisfies OtpChallengeMap;
    const parsed = JSON.parse(raw) as OtpChallengeMap;
    return typeof parsed === "object" && parsed ? parsed : ({} satisfies OtpChallengeMap);
  } catch {
    return {} satisfies OtpChallengeMap;
  }
}

function setStoredChallenges(challenges: OtpChallengeMap) {
  window.sessionStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(challenges));
}

function removeExpiredChallenges(challenges: OtpChallengeMap) {
  const now = Date.now();
  for (const [challengeId, challenge] of Object.entries(challenges)) {
    if (!challenge || challenge.expiresAt <= now || challenge.attemptsRemaining <= 0) {
      delete challenges[challengeId];
    }
  }
}

export async function sendMockOtpCode(phoneNumberInput: string, purpose: OtpPurpose): Promise<OtpResult> {
  // TODO(back-end): replace this with sendOtp API call when SMS provider is connected.
  const phoneNumber = sanitizePhone(phoneNumberInput);
  if (!isValidOtpPhoneNumber(phoneNumber)) {
    return { ok: false, error: "Please enter a valid phone number." };
  }

  if (phoneNumber !== DEV_ONLY_MOCK_PHONE_NUMBER) {
    return {
      ok: false,
      error: `SMS is not connected yet. For now use mock phone number ${DEV_ONLY_MOCK_PHONE_NUMBER}.`,
    };
  }

  const codeHash = await hashOtpCode(DEV_ONLY_MOCK_OTP_CODE);
  if (!codeHash) {
    return { ok: false, error: "Unable to send verification code right now." };
  }

  const challenges = getStoredChallenges();
  removeExpiredChallenges(challenges);

  const challengeId = createChallengeId();
  const expiresAt = Date.now() + OTP_TTL_MS;

  challenges[challengeId] = {
    challengeId,
    phoneNumber,
    purpose,
    codeHash,
    expiresAt,
    attemptsRemaining: OTP_MAX_ATTEMPTS,
  };
  setStoredChallenges(challenges);

  return {
    ok: true,
    challengeId,
    expiresAt,
    devMessage: `Dev-only mock: use ${DEV_ONLY_MOCK_PHONE_NUMBER} and code ${DEV_ONLY_MOCK_OTP_CODE}.`,
  };
}

export async function verifyMockOtpCode(
  challengeIdInput: string,
  phoneNumberInput: string,
  codeInput: string,
  purpose: OtpPurpose,
) {
  // TODO(back-end): replace this with verifyOtp API call when backend OTP endpoints are available.
  const challengeId = challengeIdInput.trim();
  const phoneNumber = sanitizePhone(phoneNumberInput);
  const code = sanitizeOtpCode(codeInput);

  if (!challengeId) {
    return { ok: false as const, error: "Please request a verification code first." };
  }

  if (!isValidOtpCode(code)) {
    return { ok: false as const, error: "Verification code must be 6 digits." };
  }

  const challenges = getStoredChallenges();
  removeExpiredChallenges(challenges);
  const challenge = challenges[challengeId];

  if (!challenge) {
    setStoredChallenges(challenges);
    return { ok: false as const, error: "Verification code expired. Please send a new code." };
  }

  if (challenge.purpose !== purpose || challenge.phoneNumber !== phoneNumber) {
    return { ok: false as const, error: "Verification details do not match. Please send a new code." };
  }

  if (challenge.expiresAt <= Date.now()) {
    delete challenges[challengeId];
    setStoredChallenges(challenges);
    return { ok: false as const, error: "Verification code expired. Please send a new code." };
  }

  const candidateHash = await hashOtpCode(code);
  if (!candidateHash || challenge.codeHash !== candidateHash) {
    challenge.attemptsRemaining -= 1;
    if (challenge.attemptsRemaining <= 0) {
      delete challenges[challengeId];
      setStoredChallenges(challenges);
      return { ok: false as const, error: "Too many attempts. Please send a new code." };
    }
    challenges[challengeId] = challenge;
    setStoredChallenges(challenges);
    return { ok: false as const, error: "Invalid verification code." };
  }

  delete challenges[challengeId];
  setStoredChallenges(challenges);
  return { ok: true as const };
}

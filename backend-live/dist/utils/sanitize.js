"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizePlainText = sanitizePlainText;
exports.sanitizeEmail = sanitizeEmail;
exports.sanitizeSlug = sanitizeSlug;
exports.sanitizeHttpUrl = sanitizeHttpUrl;
exports.sanitizeImageReference = sanitizeImageReference;
exports.sanitizeStringArray = sanitizeStringArray;
const CONTROL_CHARS_REGEX = /[\u0000-\u001f\u007f]/g;
function sanitizePlainText(value, maxLength = 500) {
    return value.replace(CONTROL_CHARS_REGEX, "").trim().slice(0, maxLength);
}
function sanitizeEmail(value) {
    return sanitizePlainText(value, 320).toLowerCase();
}
function sanitizeSlug(value) {
    const cleaned = sanitizePlainText(value, 120).toLowerCase();
    return cleaned
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
}
function sanitizeHttpUrl(value, maxLength = 500) {
    const cleaned = sanitizePlainText(value, maxLength);
    if (!cleaned) {
        return null;
    }
    try {
        const url = new URL(cleaned);
        return url.protocol === "https:" || url.protocol === "http:" ? url.toString().slice(0, maxLength) : null;
    }
    catch (_error) {
        return null;
    }
}
function sanitizeImageReference(value, maxLength = 500) {
    const cleaned = sanitizePlainText(value, maxLength);
    if (!cleaned) {
        return null;
    }
    if (cleaned.startsWith("/uploads/")) {
        return cleaned.slice(0, maxLength);
    }
    return sanitizeHttpUrl(cleaned, maxLength);
}
function sanitizeStringArray(values, maxItems = 50, maxItemLength = 120) {
    return values
        .slice(0, maxItems)
        .map((value) => sanitizePlainText(value, maxItemLength))
        .filter(Boolean);
}

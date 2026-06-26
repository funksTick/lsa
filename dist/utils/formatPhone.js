"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatPhoneNumber = formatPhoneNumber;
function formatPhoneNumber(phone) {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 11 && digits.startsWith('1')) {
        return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
    }
    if (digits.length === 10) {
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    return Number(phone);
}
// Examples
console.log(formatPhoneNumber("18016838168")); // +1 (801) 683-8168
console.log(formatPhoneNumber("8016838168")); // (801) 683-8168
console.log(formatPhoneNumber("+1-801-683-8168")); // +1 (801) 683-8168
//# sourceMappingURL=formatPhone.js.map
export function sanitizeString(inputString: string): string {
    let sanitizedString: string = inputString.toLowerCase().replace(/[^a-z0-9-]/g, '-');

    sanitizedString = sanitizedString.replace(/-+/g, '-');

    sanitizedString = sanitizedString.replace(/^-+|-+$/g, '');

    return encodeURIComponent(sanitizedString);
}

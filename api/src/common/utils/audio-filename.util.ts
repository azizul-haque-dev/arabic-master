function normalizeFilenamePart(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9_\s]/g, '')
    .trim()
    .replace(/[\s_]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export function buildAudioDownloadFilename(
  pronunciationEnglish: string,
  entityId: string,
  variant: string,
  extension: string,
): string {
  const baseName =
    normalizeFilenamePart(pronunciationEnglish) ||
    normalizeFilenamePart(entityId.replace(/-/g, '_')) ||
    'entity';
  const variantSuffix =
    variant.toUpperCase() === 'DEFAULT'
      ? ''
      : `_${normalizeFilenamePart(variant) || 'variant'}`;
  const safeExtension = extension.replace(/^\./, '').toLowerCase();

  if (!/^[a-z0-9]{1,10}$/.test(safeExtension)) {
    throw new Error('Unsupported audio filename extension.');
  }

  return `${baseName}${variantSuffix}.${safeExtension}`;
}

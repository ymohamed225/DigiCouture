// ─────────────────────────────────────────────────────────────────────────────
// DIGICOUTURE VIP — Utilitaire de Compression d'Images (Anti QuotaExceededError)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Redimensionne et compresse une image en base64 ou File pour éviter de passer
 * au-dessus du quota de stockage du navigateur (localStorage / IndexedDB).
 */
export function compressImage(
  dataUrlOrFile: string | File,
  maxWidth = 800,
  quality = 0.75
): Promise<string> {
  return new Promise((resolve) => {
    // Si ce n'est pas une chaîne base64 valide ou une image, retourner directement
    if (typeof dataUrlOrFile === 'string' && !dataUrlOrFile.startsWith('data:image')) {
      return resolve(dataUrlOrFile);
    }

    const img = new Image();

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Calculer le ratio d'aspect
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return resolve(typeof dataUrlOrFile === 'string' ? dataUrlOrFile : '');
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Convertir en JPEG compressé à qualité optimale (ex: ~60KB - 100KB)
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };

    img.onerror = () => {
      resolve(typeof dataUrlOrFile === 'string' ? dataUrlOrFile : '');
    };

    if (typeof dataUrlOrFile === 'string') {
      img.src = dataUrlOrFile;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(dataUrlOrFile);
    }
  });
}

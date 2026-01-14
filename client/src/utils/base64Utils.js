export const convertImageToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

export const validateBase64Image = (base64String) => {
  // Check if it's a valid base64 image string
  return base64String && 
         base64String.startsWith('data:image/') && 
         base64String.includes('base64,');
};

export const extractImageInfo = (base64String) => {
  if (!validateBase64Image(base64String)) {
    return null;
  }
  
  // Extract mime type and data
  const matches = base64String.match(/^data:(.+);base64,(.+)$/);
  if (!matches) return null;
  
  return {
    mimeType: matches[1],
    data: matches[2],
    size: (base64String.length * 3) / 4 - (base64String.endsWith('==') ? 2 : base64String.endsWith('=') ? 1 : 0)
  };
};
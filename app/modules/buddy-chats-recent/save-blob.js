export default function saveBlob(blob, name) {
  const a = document.createElement('a');
  a.style = 'display: none';
  let url = window.URL.createObjectURL(blob);
  a.href = url;
  a.download = name;
  a.click();
  window.URL.revokeObjectURL(url);
}

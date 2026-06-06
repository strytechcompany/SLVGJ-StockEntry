// Builds the printable label HTML used by Electron's silent print path.
// Kept as plain HTML (not a React component) so it can be serialized into a
// data: URL inside the hidden BrowserWindow without React being loaded.
export function buildLabelHtml(product) {
  const {
    product_id,
    name,
    net_weight,
    purity,
    barcode,
    barcodeImage,
  } = product;

  const safeName = String(name || "").replace(/[<>]/g, "");
  return `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Label ${product_id}</title>
  <style>
    @page { margin: 0; }
    html, body { margin: 0; padding: 0; font-family: Inter, Arial, sans-serif; color: #2A1620; }
    .label {
      width: 50mm;
      padding: 3mm;
      box-sizing: border-box;
      border: 1px solid #FBEADF;
    }
    .name  { font-size: 10pt; font-weight: 800; line-height: 1.2; margin-bottom: 1mm; }
    .meta  { font-size: 7pt;  color: #553344; margin-bottom: 1mm; }
    .id    { font-size: 7pt;  color: #BE185D; font-family: ui-monospace, Menlo, monospace; margin-top: 1mm; text-align: center; }
    img    { display: block; width: 100%; }
  </style>
</head>
<body>
  <div class="label">
    <div class="name">${safeName}</div>
    <div class="meta">${purity ? "Purity: " + purity + " · " : ""}${net_weight != null ? Number(net_weight).toFixed(3) + "g" : ""}</div>
    ${barcodeImage ? `<img src="${barcodeImage}" alt="${barcode}" />` : ""}
    <div class="id">${product_id}</div>
  </div>
  <script>window.onload = () => setTimeout(() => {}, 50);</script>
</body>
</html>`;
}

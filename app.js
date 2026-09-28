const STORAGE_KEY = "productos";
const $ = (id) => document.getElementById(id);
const money = (n) => "Q " + Number(n).toFixed(2);

// ---- Almacenamiento interno (no se muestra en pantalla) ----
function loadProducts() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
  catch { return {}; }
}
function saveProducts(products) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

// ---- Vistas ----
function show({ scan = false, result = false, save = false, again = false }) {
  $("view-scan").hidden = !scan;
  $("view-result").hidden = !result;
  $("view-save").hidden = !save;
  $("btn-again").hidden = !again;
}

// ---- Cámara ----
let scanner = null;
let scanning = false;

async function startScanner() {
  show({ scan: true });
  $("scan-msg").textContent = "Apunta la cámara al código de barras";
  if (!scanner) scanner = new Html5Qrcode("reader");
  if (scanning) return;
  try {
    const F = Html5QrcodeSupportedFormats;
    await scanner.start(
      { facingMode: "environment" },
      {
        fps: 10,
        qrbox: (w, h) => ({ width: Math.floor(w * 0.85), height: Math.floor(Math.min(h, w) * 0.4) }),
        formatsToSupport: [F.EAN_13, F.EAN_8, F.UPC_A, F.UPC_E, F.CODE_128, F.CODE_39, F.ITF],
      },
      onScan,
      () => {}
    );
    scanning = true;
  } catch (err) {
    $("scan-msg").textContent = "No se pudo abrir la cámara. Permite el acceso y recarga la página.";
  }
}

async function stopScanner() {
  if (scanner && scanning) {
    await scanner.stop().catch(() => {});
    scanning = false;
  }
}

async function onScan(code) {
  await stopScanner();
  showProduct(code);
}

// ---- Resultado ----
function showProduct(code) {
  const product = loadProducts()[code];
  const box = $("view-result");
  $("result-code").textContent = code;
  if (product) {
    box.classList.remove("result--miss");
    $("result-name").textContent = product.name;
    $("result-price").textContent = money(product.price);
    show({ result: true, again: true });
  } else {
    box.classList.add("result--miss");
    $("result-name").textContent = "Producto no registrado";
    $("result-price").textContent = "Q —";
    openSaveForm(code, true);
  }
}

// ---- Guardar ----
function openSaveForm(code = "", keepResult = false) {
  stopScanner();
  show({ result: keepResult, save: true, again: true });
  $("save-code").value = code;
  (code ? $("save-name") : $("save-code")).focus();
}

$("save-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const code = $("save-code").value.trim();
  const name = $("save-name").value.trim();
  const price = parseFloat($("save-price").value);
  if (!code || !name || isNaN(price)) return;
  const products = loadProducts();
  products[code] = { name, price };
  saveProducts(products);
  e.target.reset();
  showProduct(code);
});

$("btn-add").addEventListener("click", () => openSaveForm());
$("btn-again").addEventListener("click", startScanner);

startScanner();
const output = document.getElementById("health-output");
const button = document.getElementById("health-check");

async function checkHealth() {
  output.textContent = "Consultando /api/health...";

  try {
    const response = await fetch("/api/health");
    const payload = await response.json();
    output.textContent = `Servidor listo: ${payload.ok ? "si" : "no"} | ${payload.timestamp}`;
  } catch (error) {
    output.textContent = "No se pudo conectar con el servidor.";
  }
}

button?.addEventListener("click", checkHealth);

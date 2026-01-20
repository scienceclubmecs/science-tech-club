document.addEventListener("DOMContentLoaded", async () => {
  const logoEl = document.getElementById("siteLogo");
  const nameEl = document.getElementById("siteName");

  try {
    const res = await fetch(window.API_BASE + "/config");
    const cfg = await res.json();

    if (cfg?.logo_url && logoEl) logoEl.src = cfg.logo_url;
    if (cfg?.site_name && nameEl) nameEl.textContent = cfg.site_name;
  } catch {
    // keep defaults
  }
});

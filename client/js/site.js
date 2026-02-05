document.addEventListener("DOMContentLoaded", async () => {
  const logoEl = document.getElementById("siteLogo");
  const nameEl = document.getElementById("siteName");

  if (!logoEl && !nameEl) return; // Skip if IDs don't exist

  try {
    const res = await fetch(window.API_BASE + "/config");
    if (!res.ok) return;
    
    const cfg = await res.json();

    if (cfg?.logo_url && logoEl) {
      logoEl.src = cfg.logo_url;
      logoEl.onerror = () => {
        logoEl.src = "https://via.placeholder.com/32?text=S";
      };
    }
    
    if (cfg?.site_name && nameEl) {
      nameEl.textContent = cfg.site_name;
    }
  } catch (err) {
    console.log("Config not loaded, using defaults");
  }
});

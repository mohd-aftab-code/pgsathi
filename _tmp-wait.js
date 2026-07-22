(async () => {
  for (let i = 0; i < 60; i++) {
    try { const r = await fetch("http://localhost:3000/api/auth/csrf"); if (r.ok) { console.log("dev server ready after", i*2, "s"); return; } } catch {}
    await new Promise(r => setTimeout(r, 2000));
  }
  console.log("server did not come up");
})();

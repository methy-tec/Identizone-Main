//Progress
function showLoader(){
    document.getElementById("loader").style.display = "flex";
}
function hideLoader(){
    document.getElementById("loader").style.display = "none";

}

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  showLoader();


  const role = document.getElementById("role").value;
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    // Montrer le loader

    // Grâce au proxy → ça tape directement ton backend Render
    const res = await fetch(`http://localhost:5000/api/${role}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      document.getElementById("message").innerText = data.message || "Erreur de connexion ❌";
      return;
    }

    // Stocker le token et role
    localStorage.setItem("token", data.token);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("role", role);
    localStorage.setItem("Name", data.user.nom_complet);

    document.getElementById("message").innerText = "Connexion réussie ✅";

    // Redirection
    if (role === "super") {
      window.location.href = "./page/superadmin.html";
    } else if (role === "preadmin") {
      window.location.href = "/page/preadmin.html";
    } else {
      window.location.href = "/page/admin.html";
    }
  } catch (err) {
    document.getElementById("message").innerText = "Erreur serveur 🚨";
  } finally {
    // Cacher le loader
    hideLoader();
  }
});

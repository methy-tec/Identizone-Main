
// Stockage global
let admins = [];
let preadmins = [];
let travaillers = [];
let familles = [];
let utilisateurs = [];
let chartsStats;

let confirmCallback = null;

// Récupération du token et du nom
const token = localStorage.getItem("token");
const superadminName = localStorage.getItem("Name");

// Vérification connexion
document.addEventListener("DOMContentLoaded", () => {
  if (!token) {
    window.location.href = "../login.html";
    return;
  }
  document.querySelector(".user-info span").innerText = superadminName;
  fetchAdmins();
});

// Fonction d'affichage des messages toast
function showToast(message, type = "success") {
  const toastContainer = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);

  // Suppression automatique du toast après 4 secondes
  setTimeout(() => {
    toast.remove();
  }, 4000);
}

//Fucntion pour afficher et fermer le messange confirm
function showConfirm(title, message, callback){
  confirmCallback = callback;
  document.getElementById("confirmTitle").textContent = title;
  document.getElementById("confirmMessage").textContent = message;
  document.getElementById("confirmModal").style.display = "flex";
}
function closeConfirmModal(){
  document.getElementById("confirmModal").style.display = "none";
}
//Boutton confirm
document.getElementById('confirmBtn').addEventListener('click', () => {
  if (confirmCallback) confirmCallback();
  closeConfirmModal();
});


// Déconnexion
function logout() {
  showConfirm(
    "Deconnexion",
    "Voulez-vous vraiment vous déconnecter ?",
    () => {
      localStorage.removeItem("token");
      localStorage.removeItem("Name");
      localStorage.removeItem("role");
      localStorage.removeItem("refreshToken");
      window.location.href = "./../login.html";
    }
  )
}

// Fonction d'impression de table
function printTable(tableId, title = "Liste") {
  const table = document.getElementById(tableId);
  if (!table) return;

  // Cloner le tableau pour ne pas toucher au DOM original
  const cloneTable = table.cloneNode(true);

  // Supprimer la dernière colonne (Actions) de l'en-tête
  const ths = cloneTable.querySelectorAll("thead th");
  if (ths.length > 0) ths[ths.length - 1].remove();

  // Supprimer la dernière colonne de chaque ligne du corps
  const trs = cloneTable.querySelectorAll("tbody tr");
  trs.forEach(tr => {
    const tds = tr.querySelectorAll("td");
    if (tds.length > 0) tds[tds.length - 1].remove();
  });

  const newWindow = window.open('', '', 'width=900,height=700');
  newWindow.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
          th { background: #2a5298; color: white; }
          tr:nth-child(even) { background: #f2f2f2; }
        </style>
      </head>
      <body>
        <h2>${title}</h2>
        ${cloneTable.outerHTML}
      </body>
    </html>
  `);
  newWindow.document.close();
  newWindow.focus();
  newWindow.print();
  newWindow.close();
}

function showLoader(){
    document.getElementById("loader").style.display = "flex";
}
function hideLoader(){
    document.getElementById("loader").style.display = "none";

}

const API_URL = "http://localhost:5000/api";

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_URL}/super/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken })
    });
    if (!res.ok) throw new Error("Refresh token invalide ❌");
    const data = await res.json();
    console.log("Nouveau token:", data.accessToken);
    localStorage.setItem("token", data.accessToken);
    if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);
    return data.accessToken;
  } catch (err) {
    console.error("Erreur refresh token:", err);
    return null;
  }
}

async function fetchWithAuth(url, options = {}) {
  let token = localStorage.getItem("token");
  const headers = { ...options.headers, Authorization: `Bearer ${token}` };

  // Ne pas définir Content-Type si body est FormData
  if (options.body instanceof FormData) {
    delete headers["Content-Type"];
  }

  let res = await fetch(url, { ...options, headers });

  if (res.status === 401 || res.status === 403) {
    const newToken = await refreshAccessToken();
    if (!newToken) {
      window.location.href = "../login.html";
      return;
    }
    headers.Authorization = `Bearer ${newToken}`;
    res = await fetch(url, { ...options, headers });
  }

  return res;
}

async function fetchStats() {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/super/statistics`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const stats = await res.json();

    const data =[
      stats.superadmins,
      stats.admins,
      stats.preadmins,
      stats.travailleurs,
      stats.familles,
      stats.utilisateurs,
    ]
    if (chartsStats) {
      //Mise a jour du graphique existant
      chartsStats.data.datasets[0].data = data;
      chartsStats.update();
    }else{

          // Remplir les cartes
    document.getElementById("countSuperadmins").textContent = stats.superadmins;
    document.getElementById("countAdmins").textContent = stats.admins;
    document.getElementById("countPreadmins").textContent = stats.preadmins;
    document.getElementById("countFamilles").textContent = stats.familles;
    document.getElementById("countUtilisateurs").textContent = stats.utilisateurs;
    document.getElementById("countTravailleurs").textContent = stats.travailleurs;
    
    // Creation du diagramme en rond
    new Chart(document.getElementById("chartsStats"), {
      type: "doughnut", // ou "pie"
      data: {
        labels: ["Super Admins", "Admins", "Pré-Admins", "Travailleurs", "Familles", "Utilisateurs"],
        datasets: [{
          data: [stats.superadmins, stats.admins, stats.preadmins, stats.travailleurs, stats.familles, stats.utilisateurs],
          backgroundColor: ["#007bff", "#00c9a7", "#ffb347", "#ff7676", "#4facfe", "#43e97b"],
          borderWidth: 1
        }]
      },
      options:{
        responsive: true,
        plugins: {
          legend: { 
            position: "bottom",
            labels: { color:"#333", font: {size : 14}}
            }
        }
      }
    });
    }
    
  } catch (err) {
    console.error("Erreur chargement stats:", err);
  }
}
document.addEventListener("DOMContentLoaded", (e) => {
  fetchStats();
})

// Formater date ISO
function formatDate(isoDate) {
  if (!isoDate) return "-";
  return new Date(isoDate).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

// Charger admins
async function fetchAdmins() {
  
  try {
    const res = await fetchWithAuth(`${API_URL}/admin/list`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Erreur d'accès: " + res.status);

    admins = await res.json();
    renderAdmins(admins);
     // Mise à jour compteur
    document.getElementById("nombreAdmin").innerText = admins.length;
  } catch (err) {
    console.error(err);
    showToast("Impossible de charger les admins 🚨", "error");
  }
}

// Afficher les admins
function renderAdmins(data) {
  
  admins = data;
  
  const tbody = document.getElementById("adminTableBody");
  tbody.innerHTML = "";

  data.forEach(admin => {
    
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${admin.id}</td>
      <td>${admin.username}</td>
      <td>********</td>
      <td>${admin.nom_complet}</td>
      <td>${formatDate(admin.date_naissance)}</td>
      <td>${admin.numero_tel || "-"}</td>
      <td>${admin.adresse || "-"}</td>
      <td>${admin.camp || "-"}</td>
      <td>${formatDate(admin.createdAt)}</td>
      <td>
        <button class="btn-edit" data-id="${admin.id}">✏️</button>
        <button class="btn-voir" data-id="${admin.id}">👁</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Ajouter les event listeners apres le rendu
  document.querySelectorAll(".btn-edit").forEach(btn => {
    btn.addEventListener("click", () => editAdmin(btn.dataset.id));
  });

  document.querySelectorAll(".btn-voir").forEach(btn => {
    btn.addEventListener("click", () => voirAdmin(btn.dataset.id));
  });

}

// Ajouter admin
const addAdminForm = document.getElementById("addAdminForm");
// === Événement submit ===
addAdminForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  showLoader();

  //Construire le formulaire
  const formatData = new FormData(addAdminForm);

  try{
    const response = await fetchWithAuth(`${API_URL}/admin`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formatData,
    });

    const result = await response.json();

    if(!response.ok) throw new Error (result.message || " Erreur lors de la creation");

    //Afficher le notification
    showToast("✅Admin Ajouter avec succès !", "success");

    //Reinitialize Le formulaire
    addAdminForm.reset();

    //Fermer le formulaire
    document.getElementById("addAdminModal").style.display = "none";

    //Recharger la liste apres ajout
    fetchAdmins();
  } catch (error){
    console.error("Erreur ajout admin :", error);

    showToast("Erreur ajoute admin : ", "error");
  }finally{
    hideLoader();
  }
});




// Éditer admin
function editAdmin(id) {
  const admin = admins.find(a => a.id === id);
  if (!admin) return;

  // Remplir les champs texte
  document.getElementById("editAdminId").value = admin.id;
  document.getElementById("editUsername").value = admin.username;
  document.getElementById("editNomComplet").value = admin.nom_complet;
  document.getElementById("editDateNaissance").value = admin.date_naissance?.split("T")[0] || "";
  document.getElementById("editPassword").value = admin.password || "";
  document.getElementById("editTelephone").value = admin.numero_tel || "";
  document.getElementById("editAdresse").value = admin.adresse || "";

  // Gestion de la photo
  const previewImgPrecedent = document.getElementById("previewImgPrecedent");
  const editPhotoInput = document.getElementById("editPhoto");

  if (admin.photo) {
    previewImgPrecedent.src = getCloudinaryUrl(admin.photo); // admin.photo = public_id stocké
    previewImgPrecedent.style.display = "block";
  } else {
    previewImgPrecedent.style.display = "none";
  }

  // Réinitialiser l’input file
  editPhotoInput.value = "";

  // Quand on choisit une nouvelle photo → afficher en preview
  editPhotoInput.onchange = function (e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (ev) {
        previewImgPrecedent.src = ev.target.result;
        previewImgPrecedent.style.display = "block";
      };
      reader.readAsDataURL(file);
    }
  };

  // Ouvrir le modal
  document.getElementById("editAdminModal").style.display = "flex";
}


// Sauvegarder modifications
document.getElementById("editAdminForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  showLoader();

  const id = document.getElementById("editAdminId").value;
  const formData = new FormData();

  // Ajouter les champs texte
  formData.append("username", document.getElementById("editUsername").value);
  formData.append("nom_complet", document.getElementById("editNomComplet").value);
  formData.append("date_naissance", document.getElementById("editDateNaissance").value);
  formData.append("numero_tel", document.getElementById("editTelephone").value);
  formData.append("adresse", document.getElementById("editAdresse").value);

  // Ajouter la photo si modifiée
  const file = document.getElementById("editPhoto").files[0];
  if (file) {
    formData.append("photo", file);
  }

  try {
    const res = await fetchWithAuth(`${API_URL}/admin/update/${id}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}` // pas de "Content-Type", sinon ça casse FormData
      },
      body: formData
    });

    if (!res.ok) throw new Error("Erreur modification admin");

    showToast("Admin mis à jour ✅", "success");
    closeEditModal();
    fetchAdmins();
  } catch (err) {
    console.error(err);
    showToast("Erreur lors de la mise à jour ❌", "error");
  } finally {
    hideLoader();
  }
});


// Voir admin
function getCloudinaryUrl(publicId) {
  const cloudName = "dzdbktcxd"; // ⚠️ remplace par le vrai cloud_name Cloudinary
  return `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}.jpg`;
}
function  voirAdmin(id) {
  const admin = admins.find(a => a.id === id);
  if (!admin) return;

  const photoUrl = getCloudinaryUrl(admin.photo);

  document.getElementById("viewId").innerText = admin.id;
  document.getElementById("viewPhoto").src = photoUrl;
  document.getElementById("viewUsername").innerText = admin.username;
  document.getElementById("viewNomComplet").innerText = admin.nom_complet;
  document.getElementById("viewDateNaissance").innerText = admin.date_naissance ? formatDate(admin.date_naissance) : "-";
  document.getElementById("viewTelephone").innerText = admin.numero_tel || "-";
  document.getElementById("viewAdresse").innerText = admin.adresse || "-";
  document.getElementById("viewCamp").innerText = admin.camp || "-";

  //Effacer le QR Code précédent
  document.getElementById("qrcode").innerHTML = "";

  //Générer nouveau QR Code
  new QRCode(document.getElementById("qrcode"), {
    text: `ID:${admin.id} | Nom:${admin.nom_complet} | Tel:${admin.numero_tel}`,
    width: 80,
    height: 80,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H,
  });
  document.getElementById("viewAdminModal").style.display = "flex";
}

// Fermer modals
function closeEditModal() { document.getElementById("editAdminModal").style.display = "none"; }
function closeViewModal() { document.getElementById("viewAdminModal").style.display = "none"; }
window.addEventListener("click", e => {
  if (e.target.id === "viewAdminModal") closeViewModal();
  if (e.target.id === "editAdminModal") closeEditModal();
});

//Recherche admin en direct
document.getElementById("searchAdmin").addEventListener("input", (e) => {
  const query = e.target.value.toLowerCase();

  //Filtrer la liste globale "admins"
  const filteredAdmins = admins.filter(admin =>
  (admin.username || "").toLowerCase().includes(query) ||
  (admin.nom_complet || "").toLowerCase().includes(query) ||
  (admin.camp || "").toLowerCase().includes(query) ||
  (admin.numero_tel || "").toLowerCase().includes(query)
);


  //Mettre à jour la liste affichée
  renderAdmins(filteredAdmins)
   // Mise à jour compteur
    document.getElementById("nombreAdmin").innerText = admins.length;
});



//Partie Preadmin

//Charger des PreAdmin
async function fetchPreAdmins() {
  try {
    const res = await fetchWithAuth(`${API_URL}/preadmin/list`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Erreur d'accès: " + res.status);

    preadmins = await res.json();
    renderPreAdmins(preadmins);
    document.getElementById("nombrePreAdmin").innerText = preadmins.length;

  } catch (err) {
    console.error(err);
    showToast("Impossible de charger les Preadmins 🚨", "error");
  }
}
function renderPreAdmins(preadmins) {
  const tbody = document.getElementById("preadminTableBody");
  tbody.innerHTML = "";

  preadmins.forEach(preadmin => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${preadmin.id}</td>
      <td>${preadmin.username}</td>
      <td>********</td>
      <td>${preadmin.nom_complet}</td>
      <td>${formatDate(preadmin.date_naissance)}</td>
      <td>${preadmin.numero_tel || "-"}</td>
      <td>${preadmin.adresse || "-"}</td>
      <td>${preadmin.Admin ? preadmin.Admin.nom_complet : "-"}</td>
      <td>${formatDate(preadmin.createdAt)}</td>
      <td>
      <button class="btn-voir" data-id="${preadmin.id}">👁</button>
      <button class="btn-delete" data-id="${preadmin.id}">🗑</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Ajouter les event listeners apres le rendu
  
  document.querySelectorAll(".btn-voir").forEach(btn => {
    btn.addEventListener("click", () => voirPreAdmin(btn.dataset.id));
  });
  
  document.querySelectorAll(".btn-delete").forEach(btn => {
    btn.addEventListener("click", () => deletePreAdmin(btn.dataset.id));
  });
}

function voirPreAdmin(id) {
  const preadmin = preadmins.find(p => p.id === id);
  if (!preadmin) return;

  // Afficher les détails dans la modale
  const photoUrlP = getCloudinaryUrl(preadmin.photo);

  document.getElementById("viewPreId").innerText = preadmin.id;
  document.getElementById("viewPrePhoto").src = photoUrlP;
  document.getElementById("viewPreUsername").innerText = preadmin.username;
  document.getElementById("viewPreNomComplet").innerText = preadmin.nom_complet;
  document.getElementById("viewPreDateNaissance").innerText = preadmin.date_naissance ? formatDate(preadmin.date_naissance) : "-";
  document.getElementById("viewPreTelephone").innerText = preadmin.numero_tel || "-";
  document.getElementById("viewPreAdresse").innerText = preadmin.adresse || "-";

  //Effacer le QR Code précédent
  document.getElementById("qrcodeP").innerHTML = "";

  //Générer nouveau QR Code
  new QRCode(document.getElementById("qrcodeP"), {
    text: `ID:${preadmin.id} | Nom:${preadmin.nom_complet} | Tel:${preadmin.numero_tel}`,
    width: 80,
    height: 80,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H,
  });

  // Afficher la modale
  document.getElementById("viewPreAdminModal").style.display = "flex";
}
// Fermer modals
function closeEditPreModal() { document.getElementById("editPreAdminModal").style.display = "none"; }
function closeViewPreModal() { document.getElementById("viewPreAdminModal").style.display = "none"; }
window.addEventListener("click", e => {
  if (e.target.id === "viewPreAdminModal") closeViewPreModal();
  if (e.target.id === "editPreAdminModal") closeEditPreModal();
});

//Supprimer
async function deletePreAdmin(id) {
  showConfirm(
    "Supprimer Preadmin",
    "Voulez-vous vraiment supprimer ce Pré-Admin ?",
    async() => {
      showLoader();
      try {
      const token = localStorage.getItem("token");

      const res = await fetchWithAuth(`${API_URL}/preadmin/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const error = await res.json();
        alert("Erreur : " + error.message);
        return;
      }

      // Afficher message succès
      showToast("Pré-Admin supprimé avec succès ✅", "success");

      // Rafraîchir le tableau après suppression
      fetchPreAdmins();

    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
      // Afficher message erreur
      showToast("Une erreur est survenue ❌", "error");
    }finally{
      hideLoader();
    }
    }
  );
}


//Recherche preadmin en direct
document.getElementById("searchPreAdmin").addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();

    //Filtrer la liste globale "preadmins"
    const filteredPreAdmins = preadmins.filter(preadmin =>
    (preadmin.username || "").toLowerCase().includes(query) ||
    (preadmin.nom_complet || "").toLowerCase().includes(query) ||
    (preadmin.camp || "").toLowerCase().includes(query) ||
    (preadmin.numero_tel || "").toLowerCase().includes(query)
    );

    //Mettre à jour la liste affichée
    renderPreAdmins(filteredPreAdmins)
});
fetchPreAdmins();

//PArtie travailler
async function fetchTravaillers() {
  try {
    const res = await fetchWithAuth(`${API_URL}/travailler/list`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Erreur d'accès: " + res.status);

    travaillers = await res.json();
    renderTravaillers(travaillers);
    document.getElementById("nombreTra").innerText = travaillers.length;

  } catch (err) {
    console.error(err);
    showToast("Impossible de charger les Travaillers 🚨", "error");
  }
}
function renderTravaillers(travaillers) {
  const tbody = document.getElementById("travailTableBody");
  tbody.innerHTML = "";

  travaillers.forEach(travailler => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${travailler.id}</td>
      <td>${travailler.username}</td>
      <td>********</td>
      <td>${travailler.nom_complet}</td>
      <td>${formatDate(travailler.date_naissance)}</td>
      <td>${travailler.numero_tel || "-"}</td>
      <td>${travailler.adresse || "-"}</td>
      <td>${travailler.statut }</td>
      <td>${formatDate(travailler.createdAt)}</td>
      <td>
      <button class="btn-voir" data-id="${travailler.id}">👁</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  //Ajouter les event listeners apres le rendu
  document.querySelectorAll(".btn-voir").forEach(btn => {
    btn.addEventListener("click", () => voirTravailler(btn.dataset.id));
  });
}
function voirTravailler(id) {
  const travailleur = travaillers.find(t => t.id === id);
  if (!travailleur) return;

  // Afficher les détails dans la modale
  const photoUrlT = getCloudinaryUrl(travailleur.photo);

  document.getElementById("viewTraPhoto").src = photoUrlT;

  document.getElementById("viewTraId").innerText = travailleur.id;
  document.getElementById("viewTraUsername").innerText = travailleur.username;
  document.getElementById("viewTraNomComplet").innerText = travailleur.nom_complet;
  document.getElementById("viewTraDateNaissance").innerText = travailleur.date_naissance ? formatDate(travailleur.date_naissance) : "-";
  document.getElementById("viewTraTelephone").innerText = travailleur.numero_tel || "-";
  document.getElementById("viewTraAdresse").innerText = travailleur.adresse || "-";

  //Effacer le QR Code précédent
  document.getElementById("qrcodeT").innerHTML = "";

  //Générer nouveau QR Code
  new QRCode(document.getElementById("qrcodeT"), {
    text: `ID:${travailleur.id} | Nom:${travailleur.nom_complet} | Tel:${travailleur.numero_tel}`,
    width: 80,
    height: 80,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H,
  });

  // Afficher la modale
  document.getElementById("viewTravaillerModal").style.display = "flex";
}
// Fermer modals
function closeEditTraModal() { document.getElementById("editTravaillerModal").style.display = "none"; }
function closeViewTraModal() { document.getElementById("viewTravaillerModal").style.display = "none"; }
window.addEventListener("click", e => {
  if (e.target.id === "viewTravaillerModal") closeViewTraModal();
  if (e.target.id === "editTravaillerModal") closeEditTraModal();
});

//Recherche travailleur en direct
document.getElementById("searchTra").addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();

    //Filtrer la liste globale "travaillers"
    const filteredTravaillers = travaillers.filter(travailleur =>
    (travailleur.username || "").toLowerCase().includes(query) ||
    (travailleur.nom_complet || "").toLowerCase().includes(query) ||
    (travailleur.numero_tel || "").toLowerCase().includes(query)
    );

    //Mettre à jour la liste affichée
    renderTravaillers(filteredTravaillers)
});
fetchTravaillers();

// Partie de la famille
async function fetchFamilles() {
  try {
    const res = await fetchWithAuth(`${API_URL}/familles/list`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Erreur d'accès: " + res.status);

    familles = await res.json();
    renderFamilles(familles);
    document.getElementById("nombreFamily").innerText = familles.length;

  } catch (err) {
    console.error(err);
    showToast("Impossible de charger les Familles 🚨", "error");
  }
}
function renderFamilles(familles) {
  const tbody = document.getElementById("familyTableBody");
  tbody.innerHTML = "";

  familles.forEach(famille => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${famille.id}</td>
      <td>${famille.nom_complet}</td>
      <td>${famille.nombre_personne}</td>
      <td>${famille.pere ? famille.pere.nom + " " + famille.pere.postnom : "-"}</td>
      <td>${famille.mere ? famille.mere.nom + " " + famille.mere.postnom : "-"}</td>
      <td>
        <span class="${famille.pereStatut === "vivant" ? "badge-green" : "badge-red"}">
          ${famille.pereStatut || "-"}
        </span>
      </td>
      <td>
        <span class="${famille.mereStatut === "vivant" ? "badge-green" : "badge-red"}">
          ${famille.mereStatut || "-"}
        </span>
      </td>
      <td>${formatDate(famille.createdAt)}</td>
      <td>
        ${famille.habitat ? famille.habitat.nom : "-"}
      </td>
    `;
    tbody.appendChild(tr);
  });
}
// Fermer modals
function closeViewFamilyModal() { document.getElementById("viewFamilyModal").style.display = "none"; }
window.addEventListener("click", e => {
  if (e.target.id === "viewFamilyModal") closeViewFamilyModal();

});

//Ajoutre une famille
document.getElementById("addFamilyForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);

  try {
    const res = await fetchWithAuth(`${API_URL}/familles/`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}` },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Erreur d'accès: " + res.status);

    showToast("Famille ajoutée avec succès!✅", "success");
    document.getElementById("addFamilyForm").reset();
    document.getElementById("addFamilyModal").style.display = "none";
    fetchFamilles();
  } catch (err) {
    console.error(err);
    showToast("Impossible d'ajouter la famille 🚨", "error");
  }
});

//Recherche famille en direct
document.getElementById("searchFamily").addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();

    //Filtrer la liste globale "familles"
    const filteredFamilles = familles.filter(famille =>
    (famille.nom_complet || "").toLowerCase().includes(query) ||
    (famille.pere_famille || "").toLowerCase().includes(query) ||
    (famille.mere_famille || "").toLowerCase().includes(query)
    );
    //Mettre à jour la liste affichée
    renderFamilles(filteredFamilles);
    document.getElementById("nombreFamily").innerText = filteredFamilles.length;
});



fetchFamilles();

//PArtie Utilisateur
async function fetchUtilisateurs() {
  try {
    const res = await fetchWithAuth(`${API_URL}/users/list`);
    if (!res.ok) throw new Error("Erreur d'accès: " + res.status);

    utilisateurs = await res.json();
    renderUtilisateurs(utilisateurs);
    document.getElementById("nombreUser").innerText = utilisateurs.length;

  } catch (err) {
    console.error(err);
    showToast("Impossible de charger les utilisateurs 🚨", "error");
  }
}

function renderUtilisateurs(users) {
  const tbody = document.getElementById("userTable").querySelector("tbody") || document.createElement("tbody");
  tbody.id = "userTableBody";
  tbody.innerHTML = "";

  users.forEach(user => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${user.id}</td>
      <td>${user.nom} - ${user.postnom} - ${user.prenom}</td>
      <td>${user.lieu_naissance || "-"}</td>
      <td>${formatDate(user.date_naissance)}</td>
      <td>${user.nationalite || "-"}</td>
      <td>${user.profession || "-"}</td>
      <td>${user.niveau_etude || "-"}</td>
      <td>${user.numero_tel || "-"}</td>
      <td>${user.adresse || "-"}</td>
      <td>${formatDate(user.createdAt)}</td>
      <td>${user.Habitat ? user.Habitat.nom : "-"}</td>
      <td>
        <button class="btn-voir" data-id="${user.id}">👁</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Ajouter les event listeners apres le rendu
  document.querySelectorAll(".btn-voir").forEach(btn => {
    btn.addEventListener("click", () => voirUtilisateur(btn.dataset.id));
  });

  if (!document.getElementById("userTable").querySelector("tbody")) {
    document.getElementById("userTable").appendChild(tbody);
  }
}

document.getElementById("searchUser").addEventListener("input", (e) => {
  const query = e.target.value.toLowerCase();

  const filteredUsers = utilisateurs.filter(user =>
    (user.nom_complet || "").toLowerCase().includes(query) ||
    (user.lieu_naissance || "").toLowerCase().includes(query) ||
    (user.numero_telephone || "").toLowerCase().includes(query) ||
    (user.adresse || "").toLowerCase().includes(query)
  );

  renderUtilisateurs(filteredUsers);
  document.getElementById("nombreUser").innerText = filteredUsers.length;
});

function voirUtilisateur(id) {
  const user = utilisateurs.find(u => u.id === id);
  if (!user) return;

  // Afficher les détails dans la modale
  const photoUrlU = getCloudinaryUrl(user.photo);

  document.getElementById("viewUtilisateurId").innerText = user.id || "-";
  document.getElementById("viewUtilisateurPhoto").src = photoUrlU;
  document.getElementById("viewUtilisateurDateNaissance").innerText = formatDate(user.date_naissance);
  document.getElementById("viewUtilisateurNomComplet").innerText = user.nom + " - " + user.postnom + " - " + user.prenom;
  document.getElementById("viewUtilisateurTelephone").innerText = user.numero_tel || "-";
  document.getElementById("viewUtilisateurAdresse").innerText = user.adresse || "-";
  document.getElementById("viewUtilisateurSexe").innerText = user.sexe || "-";

  //Effacer le QR Code précédent
  document.getElementById("qrcodeU").innerHTML = "";

  //Générer nouveau QR Code
  new QRCode(document.getElementById("qrcodeU"), {
    text: `ID:${user.id} | Nom:${user.nom} ${user.postnom} ${user.prenom} | Tel:${user.numero_tel}`,
    width: 80,
    height: 80,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H,
  });

  document.getElementById("viewUtilisateurModal").style.display = "flex";
}
function closeViewUtilisateurModal() { document.getElementById("viewUtilisateurModal").style.display = "none"; }
window.addEventListener("click", e => {
  if (e.target.id === "viewUtilisateurModal") closeViewUtilisateurModal();
});



fetchUtilisateurs();


document.getElementById("btnPrintAdmin").addEventListener("click", () => {
  printTable("adminTable", "Liste des Admins");
});
document.getElementById("btnPrintFamily").addEventListener("click", () => {
  printTable("familyTable", "Liste des Familles");
});
document.getElementById("btnPrintUser").addEventListener("click", () => {
  printTable("userTable", "Liste des Utilisateurs");
});
document.getElementById("btnPrintPreAdmin").addEventListener("click", () => {
  printTable("preadminTable", "Liste des Pré-Admins");
});
document.getElementById("btnPrintTra").addEventListener("click", () =>{
  printTable("travaillerTable", "Liste des Travaillés");
})
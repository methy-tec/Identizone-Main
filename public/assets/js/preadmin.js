// Récupération du token et du nom de l'admin et role
const token = localStorage.getItem("token");
const preadminName = localStorage.getItem("Name");
const role = localStorage.getItem("role");

//Recuperation le nom du backend identizone.onrender.com/api
const API_URL = "https://identizone-backend.onrender.com/api";

// Récupérer la liste
let travaillers = [];
let familles = [];
let allFamilles = [];
let users = [];
let chartsStats;

let confirmCallback = null;

// Vérification connexion
document.addEventListener("DOMContentLoaded", () => {
  if (!token ) {
    window.location.href = "./../login.html";
  }
  document.querySelector("#preadminName").textContent = preadminName;
});

//Boutton deconnexion
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

// Fonction pour afficher les toasts
function showToast(message, type = "success") {
  const toastContainer = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
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
function printTraTable(tableId, title = "Liste") {
  const table = document.getElementById(tableId);
  if (!table) return;

  // Cloner le tableau sans modifier l'original
  const cloneTable = table.cloneNode(true);

  // Identifier les colonnes à supprimer
  const headerCells = Array.from(cloneTable.querySelectorAll("thead th"));
  const indexesToRemove = [];

  headerCells.forEach((th, index) => {
    const text = th.textContent.trim().toLowerCase();
    if (text === "actions" || text === "session") {
      indexesToRemove.push(index);
    }
  });

  // Supprimer les colonnes concernées dans l'en-tête
  indexesToRemove
    .sort((a, b) => b - a)
    .forEach(index => headerCells[index]?.remove());

  // Supprimer les mêmes colonnes dans le corps
  const rows = cloneTable.querySelectorAll("tbody tr");
  rows.forEach(tr => {
    const cells = tr.querySelectorAll("td");
    indexesToRemove.forEach(index => cells[index]?.remove());
  });

  // Ouvrir une nouvelle fenêtre pour l'impression
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
          h2 { text-align: center; color: #2a5298; }
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

//Fucntion Cloudnary
function getCloudinaryUrl(publicId) {
  const cloudName = "dzdbktcxd"; // ⚠️ remplace par le vrai cloud_name Cloudinary
  return `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}.jpg`;
}

// Loader
function showLoader() { document.getElementById("loader").style.display = "flex"; }
function hideLoader() { document.getElementById("loader").style.display = "none"; }

// Fonction fetch avec token
async function fetchWithAuth(url, options = {}) {
  const headers = { ...options.headers, Authorization: `Bearer ${token}` };
  let res = await fetch(url, { ...options, headers });

  if (res.status === 401 || res.status === 403) {
    // Redirection si token expiré
    window.location.href = "../login.html";
    localStorage.removeItem("token");
    localStorage.removeItem("Name");
    localStorage.removeItem("role");
    return;
  }
  return res;
}
// Formater date ISO
function formatDate(isoDate) {
  if (!isoDate) return "-";
  return new Date(isoDate).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}
//Parti de Travailleur

//afficher un travailler

//Ajouter un travailleur
const addTraForm = document.getElementById("addTraForm");
addTraForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  showLoader();

  const formData = new FormData(addTraForm);
  

  try{
    const res = await fetchWithAuth(`${API_URL}/travailler/`, {
      method: "POST",
      body: formData,
    });

    const result = await res.json();
    if(!res.ok) throw new Error(result.message || "Erreur access: " + res.status);

    showToast("Travailleur ajouté avec succès ✅", "success");
    closeAddTraModal();
    fetchTravaillers(); // Rafraîchir la liste
  }catch(err){
    console.error("Erreur fetch Travailler:", err);
    showToast("Erreur lors de l'ajout du travailleur ❌: " + err.message, "error");
  }finally{
    hideLoader();
  }
});



async function fetchTravaillers(){
  try{
    const res = await fetchWithAuth(`${API_URL}/travailler/list`);
    if(!res.ok) throw new Error("Erreur access: " + res.status);

    travaillers = await res.json();
    displayTravaillers(travaillers);
  }catch(err){
    console.error("Erreur fetch Travailler:", err);
    showToast("Erreur lors de la récupération des travailleurs ❌", "error");
  }
}



//Affichage table travailler
function displayTravaillers(data) {

  travaillers = data;

  const tbody = document.getElementById("travaillersTableBody");
  tbody.innerHTML = "";

  data.forEach((travailleur, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${travailleur.username}</td>
      <td>*********</td>
      <td>${travailleur.nom_complet}</td>
      <td>${formatDate(travailleur.date_naissance)}</td>
      <td>${travailleur.numero_tel}</td>
      <td>${travailleur.adresse}</td>
      <td>
        <button 
          class="btn-status ${travailleur.statut === 'actif' ? 'active' : 'inactive'}" 
          onclick="toggleStatut(${travailleur.id}, '${travailleur.statut}')">
          ${travailleur.statut === 'actif' ? '✅ Actif' : '❌ Inactif'}
        </button>
      </td>
      <td>${new Date(travailleur.createdAt).toLocaleDateString("fr-FR")}</td>
      <td>
        <button class="btn-voir" data-id="${travailleur.id}">👁️</button>
        <button class="btn-edit" data-id="${travailleur.id}">✏️</button>
        <button class="btn-delete" data-id="${travailleur.id}">🗑</button>

      </td>
    `;
    tbody.appendChild(tr);
    
  });

  // Ajouter les event listeners apres le rendu
  document.querySelectorAll(".btn-edit").forEach(btn => {
    btn.addEventListener("click", () => editTravailler(btn.dataset.id));
  });

  document.querySelectorAll(".btn-voir").forEach(btn => {
    btn.addEventListener("click", () => voirTravailler(btn.dataset.id));
  });

  document.querySelectorAll(".btn-delete").forEach(btn => {
    btn.addEventListener("click", () => deleteTravailler(btn.dataset.id));
  });

  //Mise à jour du compteur
  document.getElementById("countTravailleurs").textContent = travaillers.length;
  document.getElementById("travaillerCount").textContent = travaillers.length;

}

//Function modifier statut session
async function toggleStatut(id, currentStatut) {
  try {
    // Convertir le booléen en texte
    const nouveauStatut = currentStatut === "actif" ? "inactif" : "actif";

    const res = await fetchWithAuth(`${API_URL}/travailler/${id}/statut`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ statut: nouveauStatut })
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.message || "Erreur lors de la mise à jour du statut ❌");

    showToast(`✅ Statut modifié en ${nouveauStatut}`);
    fetchTravaillers(); // rafraîchir la liste
  } catch (error) {
    console.error("Erreur toggle statut :", error);
    showToast(error.message, "error");
  }
}

function editTravailler(id) {
  const travailler = travaillers.find(t => t.id === id);
  if (!travailler) return showToast("Travailler non trouvé.", "error");

  // Pré-remplir le formulaire avec les détails actuels
  document.getElementById("editTraId").value = travailler.id;
  document.getElementById("editTraUsername").value = travailler.username || "-";
  document.getElementById("editTraNomComplet").value = travailler.nom_complet || "-";
  document.getElementById("editTraDateNaissance").value = new Date(travailler.date_naissance).toISOString().split("T")[0] || "-";
  document.getElementById("editTraTelephone").value = travailler.numero_tel || "-";
  document.getElementById("editTraAdresse").value = travailler.adresse || "-";

  document.getElementById("editTraPassword").value = travailler.password || "";

  //Gestion de la photo
  const previewImgPrecedent = document.getElementById("previewImgPrecedent");
  const editPrePhotoInput = document.getElementById("editPrePhoto");

  if (travailler.photo) {
    previewImgPrecedent.src = getCloudinaryUrl(travailler.photo); //Pre admin.photo = public_id stocké
    previewImgPrecedent.style.display = "block";
  }else{
    previewImgPrecedent.style.display = "none";
  }

  //Reinitialiser l'input file
  editPrePhotoInput.value = "";

  //Quand on choisit une nouvelle photo -> afficher en preview
  editPrePhotoInput.onchange = function (e){
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(ev){
        previewImgPrecedent.src = ev.target.result;
        previewImgPrecedent.style.display = "block";
      };
      reader.readAsDataURL(file);
    }
  };

  // Afficher la modal
  document.getElementById("editTravaillerModal").style.display = "flex";
}
//Sauvegarder la modification du travailler
document.getElementById("editTravaillerForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  showLoader();

  const idT = document.getElementById("editTraId").value;
  const formatData = new FormData();

  //Ajouter lesm champs texte
  formatData.append("username", document.getElementById("editTraUsername").value);
  formatData.append("nom_complet", document.getElementById("editTraNomComplet").value);
  formatData.append("date_naissance", document.getElementById("editTraDateNaissance").value);
  formatData.append("numero_tel", document.getElementById("editTraTelephone").value);
  formatData.append("adresse", document.getElementById("editTraAdresse").value);
  formatData.append("password", document.getElementById("editTraPassword").value);

})

//Function voir travailleur detail
function voirTravailler(id){
  const travailleur = travaillers.find(t => t.id === id);
  if(!travailleur){
    showToast("Travailleur non trouvé ❌", "error");
    return;
  }

  const photoUrlT = getCloudinaryUrl(travailleur.photo);

  //Afficher les détails dans la modal
  document.getElementById("viewTraId").textContent = travailleur.id;
  document.getElementById("viewTraNomComplet").textContent = travailleur.nom_complet;
  document.getElementById("viewTraDateNaissance").textContent = travailleur.date_naissance;
  document.getElementById("viewTraTelephone").textContent = travailleur.numero_tel;
  document.getElementById("viewTraAdresse").textContent = travailleur.adresse;
  document.getElementById("viewTraPhoto").src = photoUrlT;



  //Effacer le code qr precedent
  document.getElementById("qrcodeT").src = "";

  //Generer le nouveau code qr
  new QRCode(document.getElementById("qrcodeT"), {
    text: `ID:${travailleur.id} | Nom:${travailleur.nom_complet} | Tel:${travailleur.numero_tel || "-"} | Adresse:${travailleur.adresse || "-"}`,
    width: 80,
    height: 80,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H,
  });

  //Afficher la modal
  document.getElementById("viewTraModal").style.display = "block";
}

//🗑 Supprimer un travailler
function deleteTravailler(id){
  showConfirm(
    "Supprimer Travailler",
    "Etes-vous sur de vouloir supprimer ce travailleur ?",
    async () => {
      showLoader();
      try {
        const res = await fetchWithAuth(`${API_URL}/travailler/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.message || "Erreur lors de la suppression ❌");

        showToast("✅ Travailleur supprimé avec succès");
        fetchTravaillers(); // rafraîchir la liste
      } catch (error) {
        console.error("Erreur suppression travailleur:", error);
        showToast(error.message, "error");
      }finally{
        hideLoader();
      }
    }
  );
}
//Recherche un travailler en direct
document.getElementById("searchTravaillers").addEventListener("input", (e) => {
  const query = e.target.value.toLowerCase();
  const filtered = travaillers.filter(travailler => 
    (travailler.username || "").toLowerCase().includes(query) ||
    (travailler.nom_complet || "").toLowerCase().includes(query) ||
    (travailler.numero_tel || "").includes(query)
  );

  //Afficher la liste filtrée
  displayTravaillers(filtered);

  //Mise à jour du compteur
  document.getElementById("travaillerCount").textContent = filtered.length;

})

//Fermer la modal
function closeViewTraModal(){
  document.getElementById("viewTraModal").style.display = "none";
}

//Si on click hors zone 
window.addEventListener("click", (e) => {
  if(e.target === document.getElementById("viewTraModal")){
    closeViewTraModal();
  }
});

//Imprimer la liste
document.getElementById("btnPrintTra").addEventListener("click", () => {
  printTraTable("travaillersTable", "Liste des Travailleurs");
});

fetchTravaillers();

//Partie de la familles

//Affichage des familles
async function fetchFamilles() {
  try{
    const res = await fetchWithAuth(`${API_URL}/familles/mes-familles`);
    if (!res.ok) throw new Error("Erreur d'accès: " + res.status);

    familles = await res.json();
    displayFamilles(familles);
    document.getElementById("nombreFamily").innerText = familles.length;

  }catch(error){
    console.error(error);
    showToast("Impossible de charger les Familles 🚨", "error");
  }
}

//Function affichage de table familles
function displayFamilles(familles){
  const tbody = document.getElementById("familyTableBody");
  tbody.innerHTML = ""; //Effacer le contenu précédent

  familles.forEach((famille, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${index + 1}</td>
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
          <button class="btn-edit" data-id="${famille.id}">✏️</button>

      </td>
    `;
    tbody.appendChild(tr);
  });

  //Ajouter les event listeners apres le rendu
  document.querySelectorAll(".btn-edit").forEach(btn => {
    btn.addEventListener("click", () => editFamille(btn.dataset.id));
  });

  //Mise à jour du compteur
  document.getElementById("nombreFamily").textContent = familles.length;
  document.getElementById("countFamilles").textContent = familles.length;
}

//Ajouter un famille
document.getElementById("addFamilyForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  showLoader()

  const nom_complet = document.getElementById("addFNomComplet").value.trim();

  if(!nom_complet){
    hideLoader();
    showToast("Veuillez entrer le nom complet de la famille!⚠️", "warning");
    return;
  }

  try {
    const res = await fetchWithAuth(`${API_URL}/familles/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nom_complet }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || "Erreur d'accès: " + res.status);

    showToast("Famille ajoutée avec succès!✅", "success");
    document.getElementById("addFamilyForm").reset();
    document.getElementById("addFamilyModal").style.display = "none";
    fetchFamilles();
  } catch (err) {
    console.error(err);
    showToast(err.message || "Impossible d'ajouter la famille 🚨", "error");
  }finally{
    hideLoader();
  }
});

//Function edit famille
function editFamille(id){
  document.getElementById("editFamilyId").value = id;
  //Récupérer les détails de la famille
  const famille = familles.find(f => f.id === id);
  if(famille){
    document.getElementById("editFNomComplet").value = famille.nom_complet;
  }
  document.getElementById("editFamilyModal").style.display = "flex";
}

//Submit edit famille
document.getElementById("editFamilyForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  showLoader()
  
  const id = document.getElementById("editFamilyId").value;
  const nom_complet = document.getElementById("editFNomComplet").value.trim();

  if(!nom_complet){
    hideLoader();
    showToast("Veuillez entrer le nom complet de la famille!⚠️", "warning");
    return;
  }

  try {
    const res = await fetchWithAuth(`${API_URL}/familles/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nom_complet }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || "Erreur d'accès: " + res.status);

    showToast("Famille modifiée avec succès!✅", "success");
    document.getElementById("editFamilyForm").reset();
    document.getElementById("editFamilyModal").style.display = "none";
    fetchFamilles();
  } catch (err) {
    console.error(err);
    showToast(err.message || "Impossible de modifier la famille 🚨", "error");
  }finally{
    hideLoader();
  }
})

//Recherche familles en direct
document.getElementById("searchFamily").addEventListener("input", (e) => {
  const query = e.target.value.trim().toLowerCase();

  //Filtre la liste
  const filteredFamilles = familles.filter(famille => 
    famille.nom_complet.toLowerCase().includes(query)
  );

  //Affiche les résultats
  displayFamilles(filteredFamilles);

  //Si aucun résultat trouvé
  if(filteredFamilles.length === 0){
    showToast("Aucune famille trouvée!⚠️", "warning");
  }
  //Mise à jour du compteur
  document.getElementById("nombreFamily").textContent = filteredFamilles.length;
});

//Imprimer la liste
document.getElementById("btnPrintFamilies").addEventListener("click", () => {
  printTraTable("familiesTable", "Liste des Familles");
});


fetchFamilles();


//Partie Utilisateur

//Previsualisation de la photo choisie
document.getElementById("addFPhoto").addEventListener("change", function(e){
  const file = e.target.files[0];
  const preview = document.getElementById("previewFPhoto");

  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      preview.src = event.target.result;
      preview.style.display = "block";
    };
    reader.readAsDataURL(file);
  }else{
    preview.style.display = "none";
  }
})


//On recupere Le Famille et on l'affiche sur le select id=addFamilyId
async function loadFamilles() {
  try {
    const res = await fetchWithAuth(`${API_URL}/familles/mes-familles`);
    const familles = await res.json();
    console.log("📦 Familles chargées :", familles);
    allFamilles = familles;

    const select = document.getElementById("addFamilyId");
    select.innerHTML = "<option value=''>Sélectionner une famille</option>";

    familles.forEach(famille => {
      const option = document.createElement("option");
      option.value = famille.id;
      option.textContent = `${famille.nom_complet} (${famille.nombre_personne} personnes)`;
      select.appendChild(option);
    });

  } catch (err) {
    console.error(err);
    showToast(err.message || "Impossible de charger les familles 🚨", "error");
  }
}

loadFamilles();

// Fonction de recherche en direct dans le select Famille
document.getElementById("searchFamilyAdd").addEventListener("input", function () {
  const searchValue = this.value.toLowerCase();
  const select = document.getElementById("addFamilyId");

  //Filtre les familles correspondant a la recherche
  const filtered = allFamilles.filter(f =>
    f.nom_complet.toLowerCase().includes(searchValue)
  );

  //Reaffiche les resultats
  select.innerHTML = "<option value=''> Sélectionner une famille </option>";

  if(filtered.length === 0){
    const noResult = document.createElement("option");
    noResult.textContent = "Aucune famille trouvée";
    noResult.disabled = true;
    select.appendChild(noResult);
  }else{
    filtered.forEach(famille => {
      const option = document.createElement("option");
      option.value = famille.id;
      option.textContent = `${famille.nom_complet} (${famille.nombre_personne} personne)`;
      select.appendChild(option);
    });
  }
});


//Soumission utilisateur
document.getElementById("addUserForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  showLoader();

  const form = e.target;
  const formData = new FormData(form);

  try{
    const res = await fetchWithAuth(`${API_URL}/users`, {
      method: "POST",
      body: formData,
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || "Erreur d'accès: " + res.status);

    showToast("Utilisateur ajouté avec succès!✅", "success");
    document.getElementById("addUserForm").reset();
    document.getElementById("previewFPhoto").src = "";
    document.getElementById("previewFPhoto").style.display = "none";
    document.getElementById("addUserModal").style.display = "none";

    fetchUsers();
  } catch (err) {
    console.error(err);
    showToast(err.message || "Impossible d'ajouter l'utilisateur 🚨", "error");
  }finally{
    hideLoader();
  }

})

//Recuperer et afficher la liste des utilisateurs
async function fetchUsers() {
  try {
    const res = await fetchWithAuth(`${API_URL}/users/list`);
    if(!res.ok) throw new Error(result.message || "Erreur d'accès: " + res.status);

    users = await res.json();
    displayUsers(users);

    //Mise à jour du compteur
    document.getElementById("userCount").textContent = users.length;

  }catch(error){
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    showToast(error.message || "Impossible de récupérer les utilisateurs 🚨", "error");
  }
}

//Affichage table utilisateur
function displayUsers(users){
  const tbody = document.getElementById("utilisateurBody");
  tbody.innerHTML = "";

  users.forEach((user, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${user.nom} - ${user.postnom} - ${user.prenom}</td>
      <td>${formatDate(user.date_naissance)}</td>
      <td>${user.lieu_naissance}</td>
      <td>${user.numero_tel}</td>
      <td>${user.adresse}</td>
      <td>${user.date_deces? formatDate(user.date_deces) : "-"}</td>
      <td>${user.famille? user.famille.nom_complet : "-"}</td>
      <td>${formatDate(user.createdAt)}</td>
      <td>
        <button class="btn-voir" data-id="${user.id}">👁</button>
        <button class="btn-deces" data-id="${user.id}">🪦</button>
        <button class="btn-edit" data-id="${user.id}">✏️</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Ajouter les event listeners apres le rendu

  document.querySelectorAll(".btn-voir").forEach(btn => {
    btn.addEventListener("click", () => viewUser(btn.dataset.id));
  });

  document.querySelectorAll(".btn-deces").forEach(btn => {
    btn.addEventListener("click", () => declareDeces(btn.dataset.id));
  });

  document.querySelectorAll(".btn-edit").forEach(btn => {
    btn.addEventListener("click", () => editUser(btn.dataset.id));
  });

  document.getElementById("userCount").textContent = users.length;
  document.getElementById("countUtilisateurs").textContent = users.length;

}

//Function Afficher les utilisateurs details
function viewUser(id){
  const user = users.find(user => user.id === id);
  if(!user) return showToast("Utilisateur non trouvé!⚠️", "error");

  const photoUrl = getCloudinaryUrl(user.photo);

  //Afficher les détails dans le modal
  document.getElementById("viewUserId").textContent = user.id;
  document.getElementById("viewUserNameComplet").textContent = `${user.nom} - ${user.postnom} - ${user.prenom}`;
  document.getElementById("viewUserDateNaissance").textContent = formatDate(user.date_naissance);
  document.getElementById("viewUserLieuNaissance").textContent = user.lieu_naissance;
  document.getElementById("viewUserTelephone").textContent = user.numero_tel;
  document.getElementById("viewUserAdresse").textContent = user.adresse;
  document.getElementById("viewUserFamille").textContent = user.famille? user.famille.nom_complet : "Aucune";

  //Afficher la photo de profil
  document.getElementById("viewUserPhoto").src = photoUrl;

  //Effacer le code qr precedent
  document.getElementById("qrcodeU").innerHTML = "";

  //Générer le nouveau code qr
  new QRCode(document.getElementById("qrcodeU"), {
    text: `ID: ${user.id} | Nom Complet: ${user.nom} - ${user.postnom} - ${user.prenom} | Tel: ${user.numero_tel} | Adresse: ${user.adresse}`,
    width: 80,
    height: 80,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H,
  });

  //Afficher le modal
  document.getElementById("viewUserModal").style.display = "flex";
}

// ✅ Fonction déclarer décès corrigée
function declareDeces(id) {
  document.getElementById("decesUserId").value = id;
  document.getElementById("modalDeces").style.display = "flex";

  // Éviter les doublons de listener
  const oldForm = document.getElementById("formDeces");
  const newForm = oldForm.cloneNode(true);
  oldForm.parentNode.replaceChild(newForm, oldForm);

  newForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    showLoader();

    const userId = document.getElementById("decesUserId").value;
    const dateDeces = document.getElementById("dateDeces").value || new Date().toISOString();
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_URL}/users/${userId}/deces`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ date_deces: dateDeces }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Erreur d'accès: " + res.status);

      showToast("Décès déclaré avec succès ✅", "success");
      newForm.reset();
      document.getElementById("modalDeces").style.display = "none";
      fetchUsers();
    } catch (err) {
      console.error(err);
      showToast(err.message || "Impossible de déclarer le décès 🚨", "error");
    } finally {
      hideLoader();
    }
  });
}               

//✏️ Fonction modifer un utilisateur
function editUser(id){
  const user = users.find(u => u.id === id);
  if (!user) return showToast("Utilisateur non trouve.", "error");

  //Pre remplir lle formulaire avec les details actuels
  document.getElementById("editUserId").value = user.id;
  document.getElementById("editFSexe").value = user.sexe;
  document.getElementById("editFNom").value = user.nom;
  document.getElementById("editFPostNom").value = user.postnom;
  document.getElementById("editFPrenom").value = user.prenom;
  document.getElementById("editFDateNaissance").value = new Date(user.date_naissance).toISOString().split("T")[0];
  document.getElementById("editFLieuNaissance").value = user.lieu_naissance;
  document.getElementById("editFNationalite").value = user.nationalite;
  document.getElementById("editFAdresse").value = user.adresse;
  document.getElementById("editFTelephone").value = user.numero_tel;
  document.getElementById("editFProfession").value = user.profession;
  document.getElementById("editFNiveauEtude").value = user.niveau_etude;
  document.getElementById("editEtatCivil").value = user.etat_civil;

  //Gestion de la photo
  const previewImgF = document.getElementById("previewFPhoto");
  const editFphoto = document.getElementById("editFPhoto");

  if (user.photo) {
    previewImgF.src = getCloudinaryUrl(user.photo);
    previewImgF.style.display = "block";
  }else{
    previewImgF.style.display = "none";
  }

  //Reinitialiser l'input file
  editFphoto.value = "";

  //Quand on choisit une nouvelle photo -> afficher en preview
  editFphoto.onchange = function(e){
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(ev){
        previewImgF.src = ev.target.result;
        previewImgF.style.display = "block";
      };
      reader.readAsDataURL(file);
    }
  };

  //Afficher la modal
  document.getElementById("editUserModal").style.display = "flex";
}
//Seauvergarder la modification
document.getElementById("editUserForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  showLoader();

  idU = document.getElementById("editUserId").value;
  
  const formatData = new FormData();

  // Ajouter les champs texte
  formatData.append("nom", document.getElementById("editFNom").value);
  formatData.append("postnom", document.getElementById("editFPostNom").value);
  formatData.append("prenom", document.getElementById("editFPrenom").value);
  formatData.append("sexe", document.getElementById("editFSexe").value);
  formatData.append("date_naissance", document.getElementById("editFDateNaissance").value);
  formatData.append("lieu_naissance", document.getElementById("editFLieuNaissance").value);
  formatData.append("nationalite", document.getElementById("editFNationalite").value);
  formatData.append("adresse", document.getElementById("editFAdresse").value);
  formatData.append("numero_tel", document.getElementById("editFTelephone").value );
  formatData.append("profession", document.getElementById("editFProfession").value);
  formatData.append("niveau_etude", document.getElementById("editFNiveauEtude").value);
  formatData.append("etat_civil", document.getElementById("editEtatCivil").value);

  //Ajouter la photo si changee
  const editFphoto = document.getElementById("editFPhoto");
  if (editFphoto.files.length > 0) {
    formatData.append("photo", editFphoto.files[0]);
  }



  try{
    const res = await fetchWithAuth(`${API_URL}/users/${idU}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,

      },
      body: formatData,
    });

    const result = await res.json();

    if(!res.ok) throw new Error(result.message || "Erreur lors de la mise à jour du Utilisateur ❌");

    //✅Succès
    showToast("Utilisateur modifie avec success ✅");
    document.getElementById("editUserModal").style.display = "none";

    //Recharger la liste 
    fetchUsers();

  }catch(err){
    console.error("Erreur update User:", err);
    showToast("Erreur mise à jour du users ❌", "error");

  }finally{
    hideLoader();
  }
});


//Recherche en direct users
document.getElementById("searchUsers").addEventListener("input", (e) => {
  const query = e.target.value.trim().toLowerCase();

  //Filter la liste globale en direct
  const filteredUsers = users.filter(user => 
    (user.nom || "").toLowerCase().includes(query) ||
    (user.postnom || "").toLowerCase().includes(query) ||
    (user.prenom || "").toLowerCase().includes(query) ||
    (user.numero_tel || "").includes(query)
  );

  //Afficher la liste filtree
  displayUsers(filteredUsers);

  //Afficher le nombre d'utilisateur trouvé
  document.getElementById("userCount").textContent = filteredUsers.length;

})


//Fermer le modal
function closeViewUserModal(){
  document.getElementById("viewUserModal").style.display = "none";
}
//Fermer le modal si on click hors zone
window.onclick = function(event){
  if (event.target === document.getElementById("viewUserModal")) {
    closeViewUserModal();
  }
}

//Imprimer la liste
document.getElementById("btnPrintUsers").addEventListener("click", () => {
  printTable("usersTable", "Liste des Utilisateurs");
});

fetchUsers();

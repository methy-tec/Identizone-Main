const name_tra = localStorage.getItem('Name');
const token = localStorage.getItem('token');
const refreshToken = localStorage.getItem('refreshToken');

let familles = [];


//Recuperation le nom du backend 
const API_URL = "http://localhost:5000/api";

// Verifie si le token est presents
document.addEventListener("DOMContentLoaded", async () => {
    if (!token) {
        window.location.href = "loginTra.html";
    }

    //  Afficher le nom de l'utilisateur connecté
    document.querySelector("#TraName").textContent = name_tra;

    function updateCurrentTime(){
    const now = new Date();
    const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    const formattedTime = now.toLocaleString('fr-FR', options);
    document.getElementById('currentDate').textContent = formattedTime;
}

//mettre à jour l'heure toutes les secondes
setInterval(updateCurrentTime, 1000);
});

//Boutton deconnexion
function logout() {
    // Efface le token et le nom de l'utilisateur de localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('Name');

    // Redirige vers la page de connexion
    window.location.href = "loginTra.html";
}

//Function fetch avec token
async function fetchWithAuth(url, options = {}) {
    const headers = { ...options.headers, Authorization: `Bearer ${token}` };
    let res = await fetch(url, { ...options, headers });

    if (res.status === 401 || res.status === 403) {
        //Redirection si token expire
        window.location.href = "loginTra.html";
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('Name');
        return;
    }
    return res;
}

// Formater date ISO
function formatDate(isoDate){
    if(!isoDate) return "-";
    return new Date(isoDate).toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });
}

//Fonction loader
function showLoader(){
    document.getElementById("loader").style.display = "flex";
}
function hideLoader(){
    document.getElementById("loader").style.display = "none";
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
// Fonction pour afficher les familles
async function fetchFamilles() {
    try{
        
        const res = await fetchWithAuth(`${API_URL}/familles/list/tra`);
        if(!res.ok) throw new Error("Erreur accès: " + res.status);

        familles = await res.json();
        displayFamilles(familles);

    }catch(err){
        console.error("Erreur fetch familles:", err);
    }
}

//Affichage des liste de familles 
function displayFamilles(familles){
    const famillesContainer = document.getElementById("familleListe");
    famillesContainer.innerHTML = "";

    familles.forEach((famille, index) => {
        const card = document.createElement("div");
        card.className = "famille-card";
        card.innerHTML = `            
            <p><strong>N• :</strong> ${index + 1}</p>
            <h3>${famille.nom_complet}</h3>
            <p><strong>P :</strong> ${famille.nombre_personne}</p>
            <button class="btn-open" onclick="ouvrirFamille('${famille.id}')">Ouvrir</button>
        `;
        famillesContainer.appendChild(card);
        document.getElementById("nombreFamilles").textContent = familles.length;
    });
}
fetchFamilles();

//Recherche en direct
const searchInput = document.getElementById("searchFamily");
if (searchInput) {
    searchInput.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase();
        const filteredFamilles = familles.filter(famille =>
            famille.nom_complet.toLowerCase().includes(query)
        );
        document.getElementById("nombreFamilles").textContent = filteredFamilles.length;
        displayFamilles(filteredFamilles);
    });
}

document.getElementById("addFamilyModal").addEventListener("submit", async (e) => {
    e.preventDefault();
    showLoader();

    const nom_complet = document.getElementById("familleName").value;

    if (!nom_complet) {
        hideLoader();
        showToast("Veuillez entrer un nom complet.", "error");
        return;
    }

    try{
        const res = await fetchWithAuth(`${API_URL}/familles/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nom_complet }),
        });
        const result = await res.json();
        if(!res.ok) throw new Error(result.message ||"Erreur création: " + res.status);

        showToast("Famille créée avec succès!");

        document.getElementById("addFamilyForm").reset();
        closeModal();
        // Rafraîchir la liste des familles
        fetchFamilles(); 

    }catch(err){
        console.error("Erreur création famille:", err);
        showToast("Erreur lors de la création de la famille.", "error");
    }finally{
        hideLoader();
    }
});


//Ouvrir une famille
function ouvrirFamille(id){
    localStorage.setItem("selectedFamilleId", id);
    localStorage.setItem("selectedFamilleNom", familles.find(f => f.id === id).nom_complet);
    window.location.href = "./file/famille.html";
}

//Fonction pour fermer le modal
function closeModal(){
    document.getElementById("addFamilyModal").style.display = "none";
}
function openModal(){
    document.getElementById("addFamilyModal").style.display = "flex";
}


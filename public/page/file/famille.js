const name_tra = localStorage.getItem("Name");
const token = localStorage.getItem("token");
const refreshToken = localStorage.getItem("refreshToken");
const familyId = localStorage.getItem("selectedFamilleId");
const familyNom = localStorage.getItem("selectedFamilleNom");

let users = [];

// Recuperation le nom du backend
const API_URL = "https://identizone-backend.onrender.com/api";

//Verifie si le token est presents
document.addEventListener("DOMContentLoaded", async () => {
  if (!token) {
    window.location.href = "../loginTra.html";
  }
  

  document.querySelector("#TraName").textContent = name_tra;
  document.querySelector("#familleNom").textContent = familyNom;

  function updateCurrentTime(){
    const now =  new Date();
    const options = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }
    const formattedTime = now.toLocaleString('fr-FR', options);
    document.querySelector("#currentDate").textContent = formattedTime;
  }

  // Mise à jour chaque seconde
  setInterval(updateCurrentTime, 1000);
});

// Boutton deconnexion
function logout() {
  // Efface le token et le nom de l'utilisateur de localStorage
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("Name");
  localStorage.removeItem("selectedFamilleId");

  // Redirige vers la page de connexion
  window.location.href = "../loginTra.html";
}
//Bouton retour
function retour(){
  window.location.href = "../travailler.html";
  localStorage.removeItem("selectedFamilleId");
}

//Fonction loader
function showLoader(){
  document.getElementById("loader").style.display = "flex";
}
//Fonction hide loader
function hideLoader(){
  document.getElementById("loader").style.display = "none";
}

//Function pour affciher les toats
function showToast(message, type = "success"){
  const toastContainer = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);
  //Supprime le toast apres 3 secondes
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

//Function fetch avec token
async function fetchWithAuth(url, options = {}) {
    const headers = { ...options.headers, Authorization: `Bearer ${token}` };
    let res = await fetch(url, { ...options, headers });

    if (res.status === 401 || res.status === 403) {
        //Redirection si token expire
        window.location.href = "../loginTra.html";
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('Name');
        return;
    }
    return res;
}

//Function pour afficher les utilisateurs de la famille
async function fetchUser() {
  try {
    const res = await fetchWithAuth(`${API_URL}/users/list/${familyId}`);
    if (!res.ok) throw new Error("Erreur lors de la recuperation des utilisateurs " + res.status);

    const result = await res.json();
    console.log("DEBUG RESULT =", result);

    // Le tableau se trouve ici :
    users = result.utilisateurs || [];

    displayUsers(users);

  } catch (error) {
    console.error("Erreur lors de la recuperation des utilisateurs:", error);
    showToast(error.message, "error");
  }
}
function displayUsers(users){
  const userList = document.getElementById("userListe");
  userList.innerHTML = "";

  users.forEach((user, index) => {
    const card = document.createElement("div");
    card.className = "user-card";
    card.innerHTML = `
      <p><strong>N•</strong> ${index + 1}</p>
      <p><strong>Nom Complet:</strong> ${user.nom} - ${user.postnom}</p>
    `;
    userList.appendChild(card);
  });

  document.getElementById("nombreUsers").textContent = users.length;
}

fetchUser();

//Recherche en direct
const searchInput = document.getElementById("searchUser");
if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();
    const filteredUsers = users.filter(user => 
      user.nom.toLowerCase().includes(query) || user.postnom.toLowerCase().includes(query)
    );
    document.getElementById("nombreUsers").textContent = filteredUsers.length;
    displayUsers(filteredUsers);
  });
}

//Fonction pour afficher les formulaire
function openUserModal(){
  document.querySelector(".modal").style.display = "flex";
  document.getElementById("addFamilleId").value = localStorage.getItem("selectedFamilleId");

}
function closeAddUserModal(){
  document.querySelector(".modal").style.display = "none";
}

//SI onclick hors du formulaire fermer le formulaire
document.addEventListener("click", (e) => {
  if (e.target === document.querySelector(".modal")) {
    closeAddUserModal();
  }
});

document.getElementById("addUserForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  showLoader();

  const formData = new FormData(e.target);

  try {
    const res = await fetch(`${API_URL}/users/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message);
    }
    document.getElementById("addUserForm").reset();
    closeAddUserModal();
    showToast("Utilisateur créé avec succès!");
    fetchUser();

  } catch (error) {
    console.error("Erreur création utilisateur:", error);
    alert(error.message);
  }finally{
    hideLoader();
  }
});


// Fonction pour afficher la section correspondante
function showSection(id) {
      document.querySelectorAll(".menu a").forEach(a => a.classList.remove("active"));
      document.querySelectorAll(".section").forEach(sec => sec.classList.remove("active"));

      document.querySelector(`.menu a[onclick="showSection('${id}')"]`).classList.add("active");
      document.getElementById(id).classList.add("active");
    }

// Fonction pour mettre à jour l'heure affichée
function updateCurrentTime(){
    const now = new Date();
    const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    const formattedTime = now.toLocaleString('fr-FR', options);
    document.getElementById('currentDate').textContent = formattedTime;
}

//mettre à jour l'heure toutes les secondes
setInterval(updateCurrentTime, 1000);

//Fucction toggle sidebar
function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const mainContent = document.querySelector('.main-content');
  
  sidebar.classList.toggle('hidden');
  mainContent.classList.toggle('full');
}

//Boutton ouvrir modal PreAdmin Formulaire
document.getElementById("btnAddPreAdmin").addEventListener("click", () =>{
    document.getElementById("addPreModal").style.display = "flex";
});
//Fermer modal PreAdmin 
function closeAddPreModal(){
    document.getElementById("addPreModal").style.display = "none";
}

//btnAddFamily
document.getElementById("btnAddFamily").addEventListener("click", () =>{
    document.getElementById("addFamilyModal").style.display = "flex";
});
//Fermer modal Family
function closeAddFamilyModal(){
    document.getElementById("addFamilyModal").style.display = "none";
}

//btnAddUser
document.getElementById("btnAddUser").addEventListener("click", () =>{
    document.getElementById("addUserModal").style.display = "flex";
});
//Fermer modal User
function closeAddUserModal(){
    document.getElementById("addUserModal").style.display = "none";
}



//Fermer les modal si clic dehors
window.onclick = function(event){
    const modalP = document.getElementById("addPreModal");
    const modalF = document.getElementById("addFamilyModal");
    const modalU = document.getElementById("addUserModal");

    if (event.target === modalP) {
        closeAddPreModal();
    }
    if (event.target === modalF) {
        closeAddFamilyModal();
    }
    if (event.target === modalU) {
        closeAddUserModal();
    }
}
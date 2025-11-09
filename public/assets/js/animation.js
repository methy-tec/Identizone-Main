    function showSection(id) {
      document.querySelectorAll(".menu a").forEach(a => a.classList.remove("active"));
      document.querySelectorAll(".section").forEach(sec => sec.classList.remove("active"));

      document.querySelector(`.menu a[onclick="showSection('${id}')"]`).classList.add("active");
      document.getElementById(id).classList.add("active");
    }

    // Bouton ouvrir modal Admin formulaire
document.getElementById("btnAddAdmin").addEventListener("click", () => {
  document.getElementById("addAdminModal").style.display = "flex";
});

//Boutton ouvrir modal Famille formulaire
document.getElementById("btnAddFamily").addEventListener("click", () => {
  document.getElementById("addFamilyModal").style.display = "flex";
});
// Fermer modal famille
function closeAddFamilyModal() {
  document.getElementById("addFamilyModal").style.display = "none";
}
// Fermer modal Admin
function closeAddAdminModal() {
  document.getElementById("addAdminModal").style.display = "none";
}
function closeEditPreAdminModal() {
  document.getElementById("editPreAdminModal").style.display = "none";
}
// Fermer modal si clic dehors
window.onclick = function(event) {
  const modal = document.getElementById("addAdminModal");
  const modalp = document.getElementById("editPreAdminModal");
  const modalf = document.getElementById("addFamilyModal");
  if (event.target === modal) {
    closeAddAdminModal();
  }
  if(event.target === modalp){
    closeEditPreAdminModal();
  }
  if(event.target === modalf){
    closeAddFamilyModal();
  }
};
function updateCurrentTime() {
  const now = new Date();
  const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
  const formattedTime = now.toLocaleString('fr-FR', options);
  document.getElementById('currentDate').textContent = formattedTime;
}
function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const mainContent = document.querySelector('.main-content');
  
  sidebar.classList.toggle('hidden');
  mainContent.classList.toggle('full');
}

// Mettre à jour l'heure toutes les secondes
setInterval(updateCurrentTime, 1000);


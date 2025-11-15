let currentStep = 1;

const steps = document.querySelectorAll(".form-step");
const nextBtns = document.querySelectorAll(".btn-next");
const prevBtns = document.querySelectorAll(".btn-prev");

// Affiche l'étape actuelle
function showStep(step) {
  steps.forEach((div, index) => {
    div.style.display = index + 1 === step ? "block" : "none";
  });
}

// Vérifie si tous les champs required de l'étape sont remplis
function validateStep(step) {
  const currentDiv = steps[step - 1];
  const requiredFields = currentDiv.querySelectorAll("[required]");

  for (let field of requiredFields) {
    if (!field.value || field.value.trim() === "") {
      field.focus();
      field.style.border = "1px solid red";
      return false;
    } else {
      field.style.border = "1px solid #ccc";
    }
  }
  return true;
}

// Bouton suivant
nextBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    // Vérifie avant de passer
    if (!validateStep(currentStep)) {
      return;
    }

    if (currentStep < steps.length) {
      currentStep++;
      showStep(currentStep);
    }
  });
});

// Bouton précédent
prevBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    if (currentStep > 1) {
      currentStep--;
      showStep(currentStep);
    }
  });
});

// Preview image
document.getElementById("addUPhoto").addEventListener("change", function(e) {
  const img = document.getElementById("previewUPhoto");
  img.src = URL.createObjectURL(e.target.files[0]);
  img.style.display = "block";
});

// Afficher première étape
showStep(currentStep);

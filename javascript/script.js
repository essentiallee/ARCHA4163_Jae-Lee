document.addEventListener("DOMContentLoaded", () => {
  const stepButtons = document.querySelectorAll(".step-toggle");

  stepButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const step = button.closest("li");
      const isComplete = step.classList.toggle("is-complete");

      button.setAttribute("aria-pressed", String(isComplete));
      button.textContent = isComplete ? "Reset" : "Done";
    });
  });
});

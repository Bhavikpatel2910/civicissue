const avatarBtn = document.getElementById("avatarBtn");
    const avatarMenu = document.getElementById("avatarMenu");

    avatarBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      avatarMenu.style.display =
        avatarMenu.style.display === "block" ? "none" : "block";
    });

    document.addEventListener("click", () => {
      avatarMenu.style.display = "none";
    });
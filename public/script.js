function checkLogin() {
  if (localStorage.getItem("token")) {
    document.getElementById("loggedIn").style.display = "block";
    document.getElementById("notLoggedIn").style.display = "none";

    const itemsTable = document.getElementById("itemsTable");
    fetch("/api/item")
      .then((r) => r.json())
      .then((items) =>
        items.forEach((item) => {
          const tr = itemsTable.insertRow();
        })
      );
  } else {
    document.getElementById("loggedIn").style.display = "none";
    document.getElementById("notLoggedIn").style.display = "block";

    const itemNamesList = document.getElementById("itemNamesList");
    fetch("/api/itemNames")
      .then((r) => r.json())
      .then((items) =>
        items.forEach((item) => {
          const li = document.createElement("li");
          li.innerText = item;
          li.classList.add("list-group-item");
          itemNamesList.appendChild(li);
        })
      );
  }
}
checkLogin();

const msgModal = bootstrap.Modal.getOrCreateInstance("#msgModal");
const msgModalText = document.getElementById("msgModalText");
const msgModalButton = document.getElementById("msgModalButton");

const logInModal = bootstrap.Modal.getOrCreateInstance("#logInModal");

async function login(e) {
  const result = await fetch("/api/login", {
    method: "POST",
    body: JSON.stringify(Object.fromEntries(new FormData(e.target))),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const response = await result.json();
  if (result.ok) {
    e.target.reset();
    localStorage.setItem("token", response.token);
    checkLogin();
    msgModalText.className = "alert alert-success";
  } else {
    msgModalButton.addEventListener(
      "click",
      (e) => {
        logInModal.show();
      },
      { once: true }
    );
    msgModalText.className = "alert alert-danger";
  }
  msgModalText.innerText = response.msg;
  logInModal.hide();
  msgModal.show();
}

function logout() {
  localStorage.removeItem("token");
  checkLogin();
}

const registerModal = bootstrap.Modal.getOrCreateInstance("#registerModal");

async function register(e) {
  const result = await fetch("/api/register", {
    method: "POST",
    body: JSON.stringify(Object.fromEntries(new FormData(e.target))),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const response = await result.json();
  if (result.ok) {
    e.target.reset();
    msgModalText.className = "alert alert-success";
  } else {
    msgModalButton.addEventListener(
      "click",
      (e) => {
        registerModal.show();
      },
      { once: true }
    );
    msgModalText.className = "alert alert-danger";
  }
  msgModalText.innerText = response.msg;
  registerModal.hide();
  msgModal.show();
}

"use strict";

const STORAGE_KEY = "productionHosts";
const WARNINGS_KEY = "productionWarningRecords";

const form = document.getElementById("website-form");
const input = document.getElementById("website-input");
const saveButton = document.getElementById("save-button");

const websiteList = document.getElementById("website-list");
const websiteCount = document.getElementById("website-count");

const resetButton = document.getElementById("reset-button");

let websites = [];
let editingIndex = -1;

// LOAD WEBSITES

async function loadWebsites() {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEY);

    websites = Array.isArray(result[STORAGE_KEY]) ? result[STORAGE_KEY] : [];

    renderWebsites();
  } catch (error) {
    console.error("Unable to load websites:", error);
    alert("Unable to load saved websites.");
  }
}

// NORMALIZE WEBSITE INPUT

function normalizeHost(value) {
  try {
    const url = new URL(value.includes("://") ? value : "https://" + value);

    if (
      !["http:", "https:"].includes(url.protocol) ||
      !url.hostname.includes(".") ||
      !/^[a-z0-9.-]+$/i.test(url.hostname) ||
      url.hostname.includes("..")
    ) {
      return null;
    }

    return url.hostname.toLowerCase().replace(/\.$/, "");
  } catch {
    return null;
  }
}

// SAVE WEBSITES

async function saveWebsites() {
  await chrome.storage.local.set({
    [STORAGE_KEY]: websites,
  });

  renderWebsites();
}

// ADD OR UPDATE WEBSITE

form.addEventListener("submit", async function (event) {
  event.preventDefault();

  const host = normalizeHost(input.value.trim());

  if (!host) {
    alert("Please enter a valid website domain.");
    return;
  }

  const duplicate = websites.some(function (website, index) {
    return website === host && index !== editingIndex;
  });

  if (duplicate) {
    alert("This website already exists.");
    return;
  }

  try {
    if (editingIndex >= 0) {
      websites[editingIndex] = host;
    } else {
      websites.push(host);
    }

    await saveWebsites();

    editingIndex = -1;
    input.value = "";
    saveButton.textContent = "Add Website";
  } catch (error) {
    console.error("Unable to save website:", error);
    alert("Unable to save website.");
  }
});

// DISPLAY WEBSITE LIST

function renderWebsites() {
  websiteList.innerHTML = "";

  websiteCount.textContent = websites.length;

  if (websites.length === 0) {
    websiteList.innerHTML = `
      <div class="empty-message">
        No production websites added yet.
      </div>
    `;

    return;
  }

  websites.forEach(function (website, index) {
    const item = document.createElement("div");
    item.className = "website-item";

    const name = document.createElement("span");
    name.className = "website-name";
    name.textContent = website;

    const actions = document.createElement("div");
    actions.className = "website-actions";

    // EDIT WEBSITE

    const editButton = document.createElement("button");

    editButton.className = "edit-button";
    editButton.textContent = "Edit";

    editButton.addEventListener("click", function () {
      input.value = website;
      editingIndex = index;

      saveButton.textContent = "Update Website";

      input.focus();
    });

    // REMOVE WEBSITE

    const removeButton = document.createElement("button");

    removeButton.className = "remove-button";
    removeButton.textContent = "Remove";

    removeButton.addEventListener("click", async function () {
      if (!confirm("Remove " + website + "?")) {
        return;
      }

      websites.splice(index, 1);

      if (editingIndex === index) {
        editingIndex = -1;
        input.value = "";
        saveButton.textContent = "Add Website";
      } else if (editingIndex > index) {
        editingIndex--;
      }

      await saveWebsites();
    });

    actions.append(editButton, removeButton);

    item.append(name, actions);

    websiteList.appendChild(item);
  });
}

// RESET ALL WARNINGS

resetButton.addEventListener("click", async function () {
  const confirmed = confirm(
    "Reset warnings for ALL saved production websites?",
  );

  if (!confirmed) return;

  try {
    await chrome.storage.local.set({
      [WARNINGS_KEY]: {},
    });

    alert(
      "All production warnings have been reset!\n\n" +
        "The 5-second warning dialog will appear the next time you visit each website.",
    );
  } catch (error) {
    console.error("Unable to reset warnings:", error);
    alert("Unable to reset production warnings.");
  }
});

// INITIALIZE

loadWebsites();

const addEngineName = document.getElementById("addEngineName");
const addEngineShortcut = document.getElementById("addEngineShortcut");
const addEngineURL = document.getElementById("addEngineURL");
const addToLeft = document.getElementById("addToLeft");
const addToRight = document.getElementById("addToRight");

function updateEnabledStatus(radio, side) {
  // Hide all enabled status indicators for the given side
  console.log("radio,side:", radio, side);
  document.querySelectorAll(`.${side}-enabled`).forEach((span) => {
    span.style.display = "none";
  });

  // Show the enabled status for the selected radio
  const selectedRow = radio.closest(".engine-row");
  const enabledSpan = selectedRow.querySelector(`.${side}-enabled`);
  console.log("selectedRow", selectedRow);
  console.log("enabledSpan", enabledSpan);
  enabledSpan.style.display = "inline";

  const searchEngineItem = radio.closest(".search-engine-item");
  const engineId = searchEngineItem.id;

  console.log("updating status for:", engineId);
  updateEngineIsEnabled(engineId, side === "left" ? 0 : 1);
}

const updateEngineIsEnabled = async (engineId, position) => {
  searchEngines.forEach((engine) => {
    if (engine.id == engineId) {
      engine.isEnabled = true;
    } else if (engine.position === position) {
      engine.isEnabled = false;
    }
  });

  await saveEnginesToStorage();
  updatePageEngines();
};

const deleteEngine = (engineId) => {
  searchEngines = searchEngines.filter((engine) => engine.id !== engineId);
};

// Update the delete button visibility based on isCustom attribute
document.querySelectorAll(".search-engine-item").forEach((item) => {
  const isCustom = item.querySelector('input[type="text"][isCustom="true"]');
  const deleteButton = item.querySelector("button");

  if (isCustom) {
    deleteButton.style.display = "inline"; // Show delete button if isCustom is true
  }
});

async function deleteCustomSearch(button) {
  const searchEngineItem = button.closest(".search-engine-item");
  const idToRemove = searchEngineItem.id;

  searchEngines = searchEngines.filter((engine) => engine.id != idToRemove);
  console.log("Deleted search engine ID:", idToRemove);
  console.log("AFTER DELETE:", searchEngines);

  await saveEnginesToStorage();
}

function populateEnginesInSettings(engines) {
  refreshSettingsEngines();
  console.log("HERE:", engines);
  const leftSection = document.querySelector(".left-engines"); // Left Search Engines section
  const rightSection = document.querySelector(".right-engines"); // Right Search Engines section

  engines.forEach((engine) => {
    console.log("LOOKING AT ENGINE IN POP:", engine);
    // Create the search engine item structure
    const searchEngineItem = document.createElement("div");
    searchEngineItem.id = engine.id;
    searchEngineItem.className = "search-engine-item";

    const engineRow = document.createElement("div");
    engineRow.className = "engine-row";

    const radioInput = document.createElement("input");
    radioInput.type = "radio";
    radioInput.name = engine.position === 0 ? "left-engine" : "right-engine";
    radioInput.id = engine.name.toLowerCase().replace(/\s+/g, "-");
    radioInput.checked = engine.isEnabled;
    radioInput.onchange = function () {
      updateEnabledStatus(radioInput, engine.position === 0 ? "left" : "right");
    };

    const label = document.createElement("label");
    label.setAttribute("for", radioInput.id);
    label.textContent = engine.name;

    const shortcutInput = document.createElement("input");
    shortcutInput.className = "setting-input shortcut-input";
    shortcutInput.type = "text";
    shortcutInput.value = engine.shortcut;
    shortcutInput.size = 5;

    const deleteButton = document.createElement("button");
    deleteButton.className = "btn-danger delete-button";
    deleteButton.textContent = "Delete";
    deleteButton.style.display = engine.isCustom ? "inline" : "none"; // Show if isCustom
    deleteButton.onclick = function () {
      deleteCustomSearch(this);
    };

    const enabledStatus = document.createElement("span");
    enabledStatus.style.color = "green";
    enabledStatus.textContent = "Enabled";
    enabledStatus.style.display = engine.isEnabled ? "inline" : "none";
    enabledStatus.className = `enabled-status ${
      engine.position === 0 ? "left-enabled" : "right-enabled"
    }`;

    const queryInput = document.createElement("input");
    queryInput.className = "setting-input";
    queryInput.type = "text";
    queryInput.value = engine.url;
    queryInput.style.width = "100%";
    queryInput.isCustom = "true";

    // Append elements to the engine row
    engineRow.appendChild(radioInput);
    engineRow.appendChild(label);
    engineRow.appendChild(shortcutInput);
    engineRow.appendChild(deleteButton);
    engineRow.appendChild(enabledStatus);

    // Append the engine row to the search engine item
    searchEngineItem.appendChild(engineRow);
    searchEngineItem.appendChild(queryInput);

    // Append the search engine item to the appropriate section
    if (engine.position === 0) {
      leftSection.appendChild(searchEngineItem);
    } else if (engine.position === 1) {
      rightSection.appendChild(searchEngineItem);
    }
  });
}

const addCustomEngine = async (position) => {
  let engine = {
    id: Math.floor(Math.random() * 10000), // Generates a random numerical id
    name: addEngineName.value,
    url: addEngineURL.value,
    shortcut: addEngineShortcut.value,
    position: position,
    isCustom: true,
    isEnabled: false,
  };

  if (
    !addEngineName.value.trim() ||
    !addEngineURL.value.trim() ||
    !addEngineShortcut.value.trim()
  ) {
    showToast(1, "Please fill in all the fields.", 3000);
    return;
  }
  // Check if an engine with the same URL exists
  if (
    searchEngines.some((existingEngine) => existingEngine.name == engine.name)
  ) {
    showToast(1, "An engine with this name already exists.", 3000);
    return;
  } else if (
    searchEngines.some(
      (existingEngine) => existingEngine.shortcut == engine.shortcut
    )
  ) {
    showToast(1, "An engine with this shortcut already exists.", 3000);
    return;
  } else if (
    searchEngines.some((existingEngine) => existingEngine.url == engine.url)
  ) {
    showToast(1, "An engine with this URL already exists.", 3000);
    return;
  } else {
    searchEngines.push(engine); // add engine to inmem array
    await saveEnginesToStorage();
      showToast(0, "Added new engine!", 3000);
  addEngineName.value = '';
  addEngineURL.value = '';
  addEngineShortcut.value = '';
  }
};

const refreshSettingsEngines = () => {
  const items = document.querySelectorAll(".search-engine-item");
  items.forEach((item) => item.remove());
};

addToLeft.onclick = () => addCustomEngine(0);
addToRight.onclick = () => addCustomEngine(1);
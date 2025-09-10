function Dropdown(root) {
  this.cacheDOM(root);
  this.init();
}

Dropdown.prototype.cacheDOM = function (root) {
  this.root = root;
  this.button = root.querySelector(".select__button");
  this.dropdown = root.querySelector(".select__dropdown");
  this.options = this.dropdown.querySelectorAll("li");
  this.selectedValue = root.querySelector(".selected__value");

  this.focusedIndex = -1;
  this.defaultValue = root.dataset.default || this.options[0]?.innerText.trim();
  this.type = root.dataset.type || "default";
};

Dropdown.prototype.init = function () {
  this.selectedValue.textContent = this.defaultValue;
  this.options.forEach((option) => {
    option.addEventListener("click", () => {
      this.selectOption(option);
      this.toggle(false);
    });
  });

  this.button.addEventListener("click", () => this.toggle());
  // PERF: keyboard events
  this.button.addEventListener("keydown", (e) => this.handleDropdownKeydown(e));
  this.dropdown.addEventListener("keydown", (e) =>
    this.handleDropdownKeydown(e),
  );

  document.addEventListener("click", (e) => {
    if (!this.root.contains(e.target)) this.toggle(false);
  });
};

Dropdown.prototype.toggle = function (open = null) {
  const isOpen =
    open !== null ? open : this.dropdown.classList.contains("hidden");
  this.dropdown.classList.toggle("hidden", !isOpen);
  this.button.setAttribute("aria-expanded", isOpen);

  if (isOpen) {
    this.focusedIndex = [...this.options].findIndex((option) =>
      option.classList.contains("selected"),
    );
    this.focusedIndex = this.focusedIndex === -1 ? 0 : this.focusedIndex;
    this.updateFocus();
  }
};

Dropdown.prototype.selectOption = function (option) {
  if (this.type === "units") {
    const group = option.dataset.group;

    this.options.forEach((o) => {
      if (o.dataset.group === group) {
        o.classList.remove("selected");
      }
    });

    option.classList.add("selected");

    const groupedSelections = {};

    [...this.options].forEach((o) => {
      if (o.classList.contains("selected")) {
        groupedSelections[o.dataset.group] = o.dataset.value;
      }
    });

    this.selectedValue.textContent = "Units";
    this.selectedOptions = groupedSelections;
  } else {
    this.options.forEach((o) => o.classList.remove("selected"));
    option.classList.add("selected");
    this.selectedValue.textContent = option.textContent.trim();
    this.selectedOptions = { default: option.dataset.value };
  }
};

Dropdown.prototype.updateFocus = function () {
  this.options.forEach((option, idx) => {
    option.setAttribute("tabindex", idx === this.focusedIndex ? "0" : "-1");
    if (idx === this.focusedIndex) option.focus();
  });
};

// PERF: keyboard handlers
Dropdown.prototype.handleButtonKeydown = function (event) {
  if (event.key === "ArrowDown") {
    event.preventDefault();
    this.toggle(true);
  } else if (event.key === "Escape") {
    this.toggle(false);
  }
};

Dropdown.prototype.handleDropdownKeydown = function (event) {
  if (event.key === "ArrowDown") {
    event.preventDefault();
    this.focusedIndex = (this.focusedIndex + 1) % this.options.length;
    this.updateFocus();
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    this.focusedIndex =
      (this.focusedIndex - 1 + this.options.length) % this.options.length;
    this.updateFocus();
  } else if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    this.selectOption(this.options[this.focusedIndex]);
    this.toggle(false);
  } else if (event.key === "Escape") {
    this.toggle(false);
  }
};

document.querySelectorAll(".select").forEach((root) => new Dropdown(root));


import "./style.css";
import type { Manufacturer, VehicleForm } from "./types/vehicle";
import { saveVehicle } from "./vehicleApi";
import { getManufacturers } from "./manufacturerApi";

const manufacturers: Manufacturer[] = [
  { id: 1, name: "Mazda" },
  { id: 2, name: "Mercedes" },
  { id: 3, name: "Honda" },
  { id: 4, name: "Ferrari" },
  { id: 5, name: "Toyota" },
];

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("Application root element was not found.");
}

app.innerHTML = `
  <main class="page">
    <section class="vehicle-card">
      <p class="eyebrow">VEHICLE MANAGEMENT</p>
      <h1>Add Vehicle</h1>
      <p class="description">
        Enter the vehicle details below.
      </p>

      <form id="vehicleForm" novalidate>
        <div class="field">
          <label for="ownerName">Owner name *</label>
          <input id="ownerName" name="ownerName"
                 maxlength="100" autocomplete="name" />
          <small class="error" id="ownerNameError"></small>
        </div>

        <div class="field">
          <label for="manufacturerId">Manufacturer *</label>
          <select id="manufacturerId" name="manufacturerId">
            <option value="">Select manufacturer</option>
            ${manufacturers
              .map(
                (manufacturer) =>
                  `<option value="${manufacturer.id}">
                    ${manufacturer.name}
                  </option>`,
              )
              .join("")}
          </select>
          <small class="error" id="manufacturerError"></small>
        </div>

        <div class="field-row">
          <div class="field">
            <label for="yearOfManufacture">Year *</label>
            <input id="yearOfManufacture"
                   name="yearOfManufacture"
                   type="number" min="1886" max="2026"
                   step="1" />
            <small class="error" id="yearError"></small>
          </div>

          <div class="field">
            <label for="weightKg">Weight (kg) *</label>
            <input id="weightKg" name="weightKg"
                   type="number" min="0.01" step="any" />
            <small class="error" id="weightError"></small>
          </div>
        </div>

        <div class="category-preview">
          <span>Estimated category</span>
          <strong id="categoryPreview">Enter a weight</strong>
          <small>Final category validation belongs to the backend.</small>
        </div>

        <p id="statusMessage" role="status" aria-live="polite"></p>

        <div class="actions">
          <button type="reset" class="secondary">Clear</button>
          <button type="submit" id="submitButton">
            Add Vehicle
          </button>
        </div>
      </form>
    </section>
  </main>
`;
  const manufacturerSelect =
    document.querySelector<HTMLSelectElement>("#manufacturerId");

  async function loadManufacturers(): Promise<void> {
    if (!manufacturerSelect) {
      console.error("Manufacturer dropdown was not found.");
      return;
    }

    manufacturerSelect.disabled = true;
    manufacturerSelect.replaceChildren(
      new Option("Loading manufacturers...", "")
    );

    try {
      const manufacturers = await getManufacturers();

      manufacturerSelect.replaceChildren(
        new Option("Select a manufacturer", ""),
        ...manufacturers.map(
          (manufacturer) =>
            new Option(manufacturer.name, String(manufacturer.id))
        )
      );
    } catch (error) {
      manufacturerSelect.replaceChildren(
        new Option("Unable to load manufacturers", "")
      );

      console.error("Manufacturer loading failed:", error);
    } finally {
      manufacturerSelect.disabled = false;
    }
  }
void loadManufacturers();
const form = document.querySelector<HTMLFormElement>("#vehicleForm")!;
const ownerNameInput =
  document.querySelector<HTMLInputElement>("#ownerName")!;
const manufacturerInput =
  document.querySelector<HTMLSelectElement>("#manufacturerId")!;
const yearInput =
  document.querySelector<HTMLInputElement>("#yearOfManufacture")!;
const weightInput =
  document.querySelector<HTMLInputElement>("#weightKg")!;
const categoryPreview =
  document.querySelector<HTMLElement>("#categoryPreview")!;
const statusMessage =
  document.querySelector<HTMLElement>("#statusMessage")!;

function getCategory(weight: number): string {
  if (weight <= 0) return "Enter a valid weight";
  if (weight < 500) return "Light";
  if (weight < 2500) return "Medium";
  return "Heavy";
}

function showError(id: string, message: string): void {
  const element = document.querySelector<HTMLElement>(`#${id}`);

  if (element) {
    element.textContent = message;
  }
}

function clearErrors(): void {
  [
    "ownerNameError",
    "manufacturerError",
    "yearError",
    "weightError",
  ].forEach((id) => showError(id, ""));
}

function getFormData(): VehicleForm {
  return {
    ownerName: ownerNameInput.value.trim(),
    manufacturerId: manufacturerInput.value
      ? Number(manufacturerInput.value)
      : "",
    yearOfManufacture: yearInput.value
      ? Number(yearInput.value)
      : "",
    weightKg: weightInput.value
      ? Number(weightInput.value)
      : "",
  };
}

function validateVehicle(vehicle: VehicleForm): boolean {
  let isValid = true;

  if (!vehicle.ownerName) {
    showError("ownerNameError", "Owner name is required.");
    isValid = false;
  } else if (vehicle.ownerName.length > 100) {
    showError("ownerNameError", "Maximum 100 characters.");
    isValid = false;
  }

  if (vehicle.manufacturerId === "") {
    showError("manufacturerError", "Select a manufacturer.");
    isValid = false;
  }

  if (
    vehicle.yearOfManufacture === "" ||
    !Number.isInteger(vehicle.yearOfManufacture) ||
    vehicle.yearOfManufacture < 1886 ||
    vehicle.yearOfManufacture > 2100
  ) {
    showError("yearError", "Enter a year from 1886 to 2100.");
    isValid = false;
  }

  if (
    vehicle.weightKg === "" ||
    !Number.isFinite(vehicle.weightKg) ||
    vehicle.weightKg <= 0
  ) {
    showError("weightError", "Weight must be greater than zero.");
    isValid = false;
  }

  return isValid;
}

weightInput.addEventListener("input", () => {
  const weight = Number(weightInput.value);

  categoryPreview.textContent =
    weightInput.value && Number.isFinite(weight) && weight > 0
      ? getCategory(weight)
      : "Enter a valid weight";
});


form.addEventListener("submit", async (event: SubmitEvent) => {
  event.preventDefault();
  clearErrors();
  statusMessage.textContent = "";

  const vehicle = getFormData();

  if (!validateVehicle(vehicle)) {
    statusMessage.textContent = "Please correct the errors.";
    return;
  }

  const submitButton =
    document.querySelector<HTMLButtonElement>("#submitButton")!;

  submitButton.disabled = true;
  submitButton.textContent = "Saving...";

  try {
    await saveVehicle(vehicle);

    statusMessage.textContent =
      "Vehicle saved successfully to the database.";

    form.reset();
  } catch (error) {
    statusMessage.textContent =
      error instanceof Error
        ? error.message
        : "An unexpected error occurred.";
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Add Vehicle";
  }
});


form.addEventListener("reset", () => {
  clearErrors();
  categoryPreview.textContent = "Enter a weight";
  statusMessage.textContent = "";
});


import {
  getVehicles,
  type VehicleListItem,
} from "./vehicleListApi";
import "./style.css";
import "./vehicle-list.css";

const tableBody =
  document.querySelector<HTMLTableSectionElement>("#vehicleTableBody")!;
const searchForm =
  document.querySelector<HTMLFormElement>("#searchForm")!;
const searchInput =
  document.querySelector<HTMLInputElement>("#searchInput")!;
const statusMessage =
  document.querySelector<HTMLElement>("#statusMessage")!;
const pageInfo =
  document.querySelector<HTMLElement>("#pageInfo")!;
const previousButton =
  document.querySelector<HTMLButtonElement>("#previousPage")!;
const nextButton =
  document.querySelector<HTMLButtonElement>("#nextPage")!;

let currentPage = 1;
let currentSearch = "";
let sortColumn = "owner";
let sortDirection = "asc";
let totalItems = 0;
let loading = false;

function addCell(row: HTMLTableRowElement, text: string): void {
  const cell = document.createElement("td");
  cell.textContent = text;
  row.appendChild(cell);
}

function renderVehicles(vehicles: VehicleListItem[]): void {
  tableBody.replaceChildren();

  if (vehicles.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");

    cell.colSpan = 5;
    cell.textContent = "No vehicles found.";
    row.appendChild(cell);
    tableBody.appendChild(row);
    return;
  }

  for (const vehicle of vehicles) {
    const row = document.createElement("tr");

    addCell(row, vehicle.ownerName);
    addCell(row, vehicle.manufacturerName);
    addCell(row, String(vehicle.yearOfManufacture));
    addCell(row, `${vehicle.weight} kg`);
    addCell(
      row,
      `${vehicle.categoryIcon ?? ""} ${vehicle.categoryName}`
    );

    tableBody.appendChild(row);
  }
}

async function loadVehicles(): Promise<void> {
  if (loading) return;

  loading = true;
  statusMessage.textContent = "Loading vehicles...";
  previousButton.disabled = true;
  nextButton.disabled = true;

  try {
    const result = await getVehicles({
      search: currentSearch,
      page: currentPage,
      sortColumn,
      sortDirection,
    });

    totalItems = result.totalItems;
    currentPage = result.currentPage;

    renderVehicles(result.vehicles);

    const totalPages = Math.max(
      1,
      Math.ceil(totalItems / result.pageSize)
    );

    pageInfo.textContent =
      `Page ${currentPage} of ${totalPages} · ${totalItems} vehicles`;

    previousButton.disabled = currentPage <= 1;
    nextButton.disabled = currentPage >= totalPages;

    statusMessage.textContent = "";
  } catch (error) {
    tableBody.replaceChildren();
    statusMessage.textContent =
      error instanceof Error
        ? error.message
        : "An unexpected error occurred.";
    pageInfo.textContent = "";
  } finally {
    loading = false;
  }
}

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  currentSearch = searchInput.value.trim();
  currentPage = 1;
  void loadVehicles();
});

document.querySelector("#clearSearch")!.addEventListener("click", () => {
  searchInput.value = "";
  currentSearch = "";
  currentPage = 1;
  void loadVehicles();
});

previousButton.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    void loadVehicles();
  }
});

nextButton.addEventListener("click", () => {
  const totalPages = Math.max(1, Math.ceil(totalItems / 10));

  if (currentPage < totalPages) {
    currentPage++;
    void loadVehicles();
  }
});

document.querySelectorAll<HTMLButtonElement>("[data-sort]")
  .forEach((button) => {
    button.addEventListener("click", () => {
      const column = button.dataset.sort;
      if (!column) return;

      if (sortColumn === column) {
        sortDirection = sortDirection === "asc" ? "desc" : "asc";
      } else {
        sortColumn = column;
        sortDirection = "asc";
      }

      currentPage = 1;
      void loadVehicles();
    });
  });

void loadVehicles();

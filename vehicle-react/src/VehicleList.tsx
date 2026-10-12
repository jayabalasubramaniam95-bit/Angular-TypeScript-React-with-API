
import { useEffect, useState, type FormEvent } from "react";
import { getVehicles } from "./vehicleListApi";
import type { VehicleListItem } from "./vehicleListApi";

interface VehicleListProps {
  onAddVehicle: () => void;
}

function VehicleList({ onAddVehicle }: VehicleListProps) {
  const [vehicles, setVehicles] = useState<VehicleListItem[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [sortColumn, setSortColumn] = useState("owner");
  const [sortDirection, setSortDirection] = useState("asc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadVehicles() {
      setLoading(true);
      setError("");

      try {
        const result = await getVehicles({
          search,
          page,
          sortColumn,
          sortDirection,
        });

        if (!cancelled) {
          setVehicles(result.vehicles);
          setPageSize(result.pageSize);
          setTotalItems(result.totalItems);
        }
      } catch {
        if (!cancelled) {
          setError("Unable to load vehicles. Please try again.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadVehicles();

    return () => {
      cancelled = true;
    };
  }, [search, page, sortColumn, sortDirection]);

  const totalPages = Math.max(
    1,
    Math.ceil(totalItems / pageSize),
  );

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  function handleSort(column: string) {
    if (sortColumn === column) {
      setSortDirection((current) =>
        current === "asc" ? "desc" : "asc",
      );
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }

    setPage(1);
  }

  function sortLabel(column: string) {
    if (sortColumn !== column) return "";
    return sortDirection === "asc" ? " ↑" : " ↓";
  }

  return (
    <section>
      <div className="list-heading">
        <div>
          <h2>Vehicle List</h2>
          <p>View and search your vehicles.</p>
        </div>
      </div>

      <form className="search-form" onSubmit={handleSearch}>
        <input
          value={searchInput}
          onChange={(event) =>
            setSearchInput(event.target.value)
          }
          placeholder="Search owner or manufacturer"
          aria-label="Search vehicles"
        />

        <button type="submit">Search</button>

        <button
          type="button"
          onClick={() => {
            setSearchInput("");
            setSearch("");
            setPage(1);
          }}
        >
          Clear
        </button>
      </form>

      {loading && <p>Loading vehicles...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>
                    <button onClick={() => handleSort("owner")}>
                      Owner{sortLabel("owner")}
                    </button>
                  </th>
                  <th>
                    <button
                      onClick={() => handleSort("manufacturer")}
                    >
                      Manufacturer{sortLabel("manufacturer")}
                    </button>
                  </th>
                  <th>
                    <button onClick={() => handleSort("year")}>
                      Year{sortLabel("year")}
                    </button>
                  </th>
                  <th>
                    <button onClick={() => handleSort("weight")}>
                      Weight (kg){sortLabel("weight")}
                    </button>
                  </th>
                  <th>Category</th>
                </tr>
              </thead>

              <tbody>
                {vehicles.map((vehicle) => (
                  <tr key={vehicle.id}>
                    <td>{vehicle.ownerName}</td>
                    <td>{vehicle.manufacturerName}</td>
                    <td>{vehicle.yearOfManufacture}</td>
                    <td>{vehicle.weight.toLocaleString()}</td>
                    <td>
                      {vehicle.categoryIcon} {vehicle.categoryName}
                    </td>
                  </tr>
                ))}

                {vehicles.length === 0 && (
                  <tr>
                    <td colSpan={5}>No vehicles found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <span>
              {totalItems} vehicle(s) · Page {page} of {totalPages}
            </span>

            <div>
              <button
                disabled={page <= 1}
                onClick={() => setPage((current) => current - 1)}
              >
                Previous
              </button>

              <button
                disabled={page >= totalPages}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

export default VehicleList;

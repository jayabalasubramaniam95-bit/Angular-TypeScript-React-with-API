
import { useEffect, useState } from "react";
import { createVehicle, getManufacturers } from "./api";
import type { Manufacturer } from "./types/vehicle";
import "./App.css";

function AddVehicle() {
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [ownerName, setOwnerName] = useState("");
  const [manufacturerId, setManufacturerId] = useState("");
  const [year, setYear] = useState("");
  const [weightKg, setWeight] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getManufacturers()
      .then(setManufacturers)
      .catch(() => setError("Unable to load manufacturers."));
  }, []);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const parsedYear = Number(year);
    const parsedWeight = Number(weightKg);

    if (!ownerName.trim()) {
      setError("Owner name is required.");
      return;
    }

    if (!manufacturerId) {
      setError("Please select a manufacturer.");
      return;
    }

    if (
      !Number.isInteger(parsedYear) ||
      parsedYear < 1886 ||
      parsedYear > 2100
    ) {
      setError("Enter a valid manufacturing year (1886–2100).");
      return;
    }

    if (!Number.isFinite(parsedWeight) || parsedWeight <= 0) {
      setError("Weight must be greater than zero.");
      return;
    }

    setLoading(true);

    try {
      await createVehicle({
        ownerName: ownerName.trim(),
        manufacturerId: Number(manufacturerId),
        yearOfManufacture: parsedYear,
        weightKg: parsedWeight,
      });

      setSuccess("Vehicle added successfully!");
      setOwnerName("");
      setManufacturerId("");
      setYear("");
      setWeight("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save vehicle.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <main>
        <section>
          <h2>Add Vehicle</h2>
          <p>Enter the vehicle details below.</p>

          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}

          <form onSubmit={handleSubmit}>
            <label htmlFor="ownerName">Owner Name</label>
            <input
              id="ownerName"
              value={ownerName}
              maxLength={100}
              onChange={(e) => setOwnerName(e.target.value)}
              required
            />

            <label htmlFor="manufacturer">Manufacturer</label>
            <select
              id="manufacturer"
              value={manufacturerId}
              onChange={(e) => setManufacturerId(e.target.value)}
              required
            >
              <option value="">Select manufacturer</option>
              {manufacturers.map((manufacturer) => (
                <option key={manufacturer.id} value={manufacturer.id}>
                  {manufacturer.name}
                </option>
              ))}
            </select>

            <label htmlFor="year">Year of Manufacture</label>
            <input
              id="year"
              type="number"
              min={1886}
              max={2100}
              step={1}
              value={year}
              onChange={(e) => setYear(e.target.value)}
              required
            />

            <label htmlFor="weight">Weight (kg)</label>
            <input
              id="weight"
              type="number"
              min="0.01"
              step="any"
              value={weightKg}
              onChange={(e) => setWeight(e.target.value)}
              required
            />

            <button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Vehicle"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}

export default AddVehicle;

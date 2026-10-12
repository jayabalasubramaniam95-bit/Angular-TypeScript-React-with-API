
import { useState } from "react";
import AddVehicle from "./AddVehicle";
import VehicleList from "./VehicleList";
import "./App.css";

function App() {
  const [page, setPage] = useState<"list" | "add">("list");

  return (
    <div className="app">
      <header className="header">
        <h1>Vehicle Management</h1>

        <nav>
          <button onClick={() => setPage("list")}>
            Vehicle List
          </button>

          <button onClick={() => setPage("add")}>
            Add Vehicle
          </button>
        </nav>
      </header>

      <main>
        {page === "list" ? (
          <VehicleList
            onAddVehicle={() => setPage("add")}
          />
        ) : (
          <AddVehicle />
        )}
      </main>
    </div>
  );
}

export default App;

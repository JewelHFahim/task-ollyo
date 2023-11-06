import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";

const App = () => {
  
  const { data: imgs = [], refetch } = useQuery({
    queryKey: ["images"],
    queryFn: async () => {
      const res = await fetch("http://localhost:5000/items");
      const data = await res.json();
      return data;
    },
  });

  const [selectedItems, setSelectedItems] = useState([]); // Array to store selected item IDs
  
  const handleDelete = async () => {
    // Check if there are selected items
    if (selectedItems.length > 0) {
      // Create a copy of selectedItems to ensure consistent behavior
      const itemsToDelete = [...selectedItems];

      // Iterate over selected items and delete them using async/await
      for (const id of itemsToDelete) {
        try {
          const response = await fetch(`http://localhost:5000/items/${id}`, {
            method: "DELETE",
          });

          if (response.ok) {
            console.log(`Item with ID ${id} deleted successfully.`);
            toast.success(`Item with ID ${id} deleted successfully.`);
            refetch();
          } else {
            refetch();
            console.error(
              `Error deleting item with ID ${id}:`,
              response.status
            );
            toast.error(`Error deleting item with ID ${id}:`, response.status);
          }
        } catch (error) {
          console.error(`Error deleting item with ID ${id}:`, error);
          toast.error(`Error deleting item with ID ${id}:`, error);
        }
      }

      // Clear the selected items
      setSelectedItems([]);
    }
  };

  const handleItemSelection = (id) => {
    // Check if the item is already selected
    if (selectedItems.includes(id)) {
      // If selected, remove it from the list
      setSelectedItems((prevSelectedItems) =>
        prevSelectedItems.filter((itemId) => itemId !== id)
      );
    } else {
      // If not selected, add it to the list
      setSelectedItems((prevSelectedItems) => [...prevSelectedItems, id]);
    }
  };

  return (
    <div className="grid grid-cols-5 gap-5 m-20">

      {imgs?.map((item, i) => (
        <div
          key={i}
          className={`w-[250px] h-[250px] border p-5 flex flex-col justify-between items-center ${
            selectedItems.includes(item.id)
              ? "border-red-600"
              : "border-green-600"
          }`}
        >
          <img src={item.img} alt="" className="w-[100px] h-[100px]" />

          <input
            className="w-[35px] h-[35px]"
            type="checkbox"
            onChange={() => handleItemSelection(item.id)}
            checked={selectedItems.includes(item.id)}
          />


        </div>
      ))}



      {selectedItems.length > 0 && (
        <button
          onClick={handleDelete}
          className="px-8 py-1 border border-red-600"
        >
          Delete Selected
        </button>
      )}

-
    </div>
  );
};

export default App;
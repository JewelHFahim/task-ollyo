/* eslint-disable react/prop-types */
import { useCallback, useEffect, useRef, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import toast from "react-hot-toast";

const Card = ({
  src,
  title,
  id,
  index,
  moveImage,
  handleItemSelection,
  isSelected,
}) => {
  const ref = useRef(null);

  const [, drop] = useDrop({
    accept: "image",
    hover: (item, monitor) => {
      if (!ref.current) {
        return;
      }

      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      moveImage(dragIndex, hoverIndex);

      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: "image",
    item: () => ({ id, index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0 : 1;
  drag(drop(ref));

  return (
    <div>
      <div ref={ref} style={{ opacity }} className="card">
        <img src={src} alt={title} className="w-[250px] h-[250px]" />

        <input
          className="w-[35px] h-[35px]"
          type="checkbox"
          onChange={() => handleItemSelection(id)}
          checked={isSelected}
        />
        
      </div>
    </div>
  );
};

const Test = () => {
  const [images, setImages] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/items")
      .then((response) => response.json())
      .then((data) => setImages(data));
  }, []);

  const moveImage = useCallback((dragIndex, hoverIndex) => {
    setImages((prevImages) => {
      const clonedImages = [...prevImages];
      const removedImage = clonedImages.splice(dragIndex, 1)[0];
      clonedImages.splice(hoverIndex, 0, removedImage);
      return clonedImages;
    });
  }, []);

  const handleItemSelection = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems((prevSelectedItems) =>
        prevSelectedItems.filter((itemId) => itemId !== id)
      );
    } else {
      setSelectedItems((prevSelectedItems) => [...prevSelectedItems, id]);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedItems.length > 0) {
      const itemsToDelete = [...selectedItems];

      for (const id of itemsToDelete) {
        try {
          const response = await fetch(`http://localhost:5000/items/${id}`, {
            method: "DELETE",
          });

          if (response.ok) {
            console.log(`Item with ID ${id} deleted successfully.`);
            toast.success(`Item with ID ${id} deleted successfully.`);
          } else {
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

      setSelectedItems([]);
    }
  };

  return (
    <div className="p-20 flex flex-col  items-center ">
      <div className="flex justify-end w-full border-b">
        {selectedItems.length > 0 && (
          <button
            onClick={handleDeleteSelected}
            className="px-8 py-1 border border-slate-600 text-red-600 text-[20px] font-semibold"
          >
            Delete Selected
          </button>
        )}
      </div>

      <main className="grid grid-cols-4 gap-10">
        {images.map((image, index) => (
          <Card
            key={image.id}
            src={image.img}
            title={image.title}
            id={image.id}
            index={index}
            moveImage={moveImage}
            handleItemSelection={handleItemSelection}
            isSelected={selectedItems.includes(image.id)}
          />
        ))}
      </main>
    </div>
  );
};

export default Test;

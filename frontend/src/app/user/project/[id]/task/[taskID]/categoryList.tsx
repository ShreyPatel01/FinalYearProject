import { ObjectId } from "mongoose";
import React from "react";

interface Category {
  categoryID: ObjectId;
  categoryName: string;
}

interface CategoryListProps {
  categories: Category[];
  changeChosenCategory: (newCategory: string) => void;
}

const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  changeChosenCategory,
}) => {
  return (
    <select
      className="select select-bordered bg-slate-50 text-black"
      onChange={(e) => {
        changeChosenCategory(e.target.value);
      }}
    >
      <option disabled selected>
        Choose a new category
      </option>
      {categories.map((category: Category) => (
        <option
          key={category.categoryID.toString()}
          value={category.categoryID.toString()}
        >
          {category.categoryName}
        </option>
      ))}
    </select>
  );
};

export default CategoryList;

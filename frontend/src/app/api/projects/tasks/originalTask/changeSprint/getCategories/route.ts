import Category from "@/src/models/categoryModel";
import Sprint from "@/src/models/sprintModel";
import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/src/dbConfig/dbConfig";
import { ObjectId } from "mongoose";

connect();

interface CategoryObject {
    categoryID: ObjectId;
    categoryName: string;
  }

export async function GET(request: NextRequest){
    try {
        const queryParams = request.nextUrl.searchParams;
        const selectedSprintID = queryParams.get('selectedSprint');
        let categoryList: CategoryObject[] = [];
    
        const sprint = await Sprint.findOne({_id: selectedSprintID});
        if(!sprint){
            return NextResponse.json({message:"Sprint not found", status: 404, invalidSprintID: selectedSprintID});
        }
        const categoryIDs = sprint.sprintCategories;
        for(const categoryID of categoryIDs){
            const category = await Category.findOne({_id: categoryID});
            if(!category){
                return NextResponse.json({message: "Category not found", status: 404, invalidCategoryID: categoryID});
            }
            const categoryName = category.categoryName;
            const idOfCategory = category._id;
            const categoryObject = {categoryID: idOfCategory, categoryName: categoryName}
            categoryList.push(categoryObject);
        }
        return NextResponse.json({success: true, categoryList: categoryList, message: "Retrieved all categories of the selected sprint"});
    } catch (error:any) {
        console.error(error);
        return NextResponse.json({error: error.message, status:500});
    }
}
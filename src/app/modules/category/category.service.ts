import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { ICategoryFilterables, ICategory } from './category.interface';
import { Category } from './category.model';
import { JwtPayload } from 'jsonwebtoken';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { paginationHelper } from '../../../helpers/paginationHelper';
import { categorySearchableFields } from './category.constants';
import { Types } from 'mongoose';
import removeFile from '../../../helpers/image/remove';


const createCategory = async (
  user: JwtPayload,
  payload: ICategory
): Promise<ICategory> => {
  try {
    const result = await Category.create(payload);
    if (!result) {
      if (payload.image) await removeFile(payload.image);
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Failed to create Category, please try again with valid data.'
      );
    }

    return result;
  } catch (error: any) {
    if (payload.image) await removeFile(payload.image);
    if (error.code === 11000) {
      throw new ApiError(StatusCodes.CONFLICT, 'Duplicate entry found');
    }
    throw error;
  }
};

const getAllCategorys = async (

) => {
  const result = await Category.find({}).lean();
  return result;
};



const updateCategory = async (
  id: string,
  payload: Partial<ICategory>
): Promise<ICategory | null> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid Category ID');
  }

  const result = await Category.findByIdAndUpdate(
    new Types.ObjectId(id),
    { $set: payload },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!result) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Requested category not found, please try again with valid id'
    );
  }

  return result;
};

const deleteCategory = async (id: string): Promise<ICategory> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid Category ID');
  }

  const result = await Category.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Something went wrong while deleting category, please try again with valid id.'
    );
  }

  // Remove associated files
  if (result.image) {
    await removeFile(result.image);
  }

  return result;
};

export const CategoryServices = {
  createCategory,
  getAllCategorys,

  updateCategory,
  deleteCategory,
};
import { getJson } from 'serpapi';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { IPlanFilterables, IPlan, ISearchQuery, ISearchResult } from './plan.interface';
import { Plan } from './plan.model';
import { JwtPayload } from 'jsonwebtoken';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { paginationHelper } from '../../../helpers/paginationHelper';
import { planSearchableFields } from './plan.constants';
import { Types } from 'mongoose';
import removeFile from '../../../helpers/image/remove';
import { Request } from '../request/request.model';
import { REQUEST_STATUS } from '../request/request.interface';
import config from '../../../config';

type createPlan = IPlan & {
  latitude?: number
  longitude?: number
}

const createPlan = async (
  user: JwtPayload,
  payload: createPlan
): Promise<IPlan> => {
  try {

    if (
      typeof payload.latitude === 'number' &&
      typeof payload.longitude === 'number'
    ) {
      payload.location = {
        type: 'Point',
        coordinates: [payload.longitude, payload.latitude],
      }
    }

    payload.createdBy = user.authId


    const result = await Plan.create(payload);
    if (!result) {
      if (payload.images) { removeFile(payload.images) }

      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Failed to create Plan, please try again with valid data.'
      );
    }

    return result;
  } catch (error: any) {
    if (payload.images) { removeFile(payload.images) }

    if (error.code === 11000) {
      throw new ApiError(StatusCodes.CONFLICT, 'Duplicate entry found');
    }
    throw error;
  }
};

const getAllPlans = async (
  user: JwtPayload,
  filterables: IPlanFilterables,
  pagination: IPaginationOptions
) => {
  const { searchTerm, ...filterData } = filterables;
  const { page, skip, limit, sortBy, sortOrder } = paginationHelper.calculatePagination(pagination);

  const andConditions = [];

  // Search functionality
  if (searchTerm) {
    andConditions.push({
      $or: planSearchableFields.map((field) => ({
        [field]: {
          $regex: searchTerm,
          $options: 'i',
        },
      })),
    });
  }

  // Filter functionality
  if (Object.keys(filterData).length) {
    andConditions.push({
      $and: Object.entries(filterData).map(([key, value]) => ({
        [key]: value,
      })),
    });
  }

  andConditions.push({ 'createdBy': user.authId })

  const whereConditions = andConditions.length ? { $and: andConditions } : {};

  const [result, total] = await Promise.all([
    Plan
      .find(whereConditions)
      .skip(skip)
      .limit(limit)
      .sort({ [sortBy]: sortOrder }).populate('activities').populate('friends').populate('createdBy'),
    Plan.countDocuments(whereConditions),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: result,
  };
};

const getSinglePlan = async (id: string): Promise<IPlan> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid Plan ID');
  }

  const result = await Plan.findById(id).populate('createdBy').populate('activities').populate('friends');
  if (!result) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Requested plan not found, please try again with valid id'
    );
  }

  return result;
};

const updatePlan = async (
  id: string,
  payload: Partial<IPlan>
): Promise<IPlan | null> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid Plan ID');
  }

  const result = await Plan.findByIdAndUpdate(
    new Types.ObjectId(id),
    { $set: payload },
    {
      new: true,
      runValidators: true,
    }
  ).populate('activities').populate('friends');

  if (!result) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Requested plan not found, please try again with valid id'
    );
  }

  return result;
};

const deletePlan = async (id: string): Promise<IPlan> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid Plan ID');
  }

  const result = await Plan.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Something went wrong while deleting plan, please try again with valid id.'
    );
  }

  // Remove associated files
  if (result.images) {
    removeFile(result.images);
  }

  return result;
};


const removePlanFriend = async (planId: string, userId: string): Promise<IPlan | null> => {
  if (!Types.ObjectId.isValid(planId)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid Plan ID');
  }
  console.log(planId, userId, "planId, userId");
  const result = await Plan.findByIdAndUpdate(
    planId,
    { $pull: { friends: userId } },
    { new: true, runValidators: true }
  ).populate('activities').populate('friends');

  await Request.updateOne({
    planId: new Types.ObjectId(planId),
    requestedTo: new Types.ObjectId(userId),
    status: REQUEST_STATUS.PENDING
  }, { status: REQUEST_STATUS.REJECTED }, { new: true, runValidators: true });


  if (!result) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Requested plan not found'
    );
  }

  return result;
};

const getPlansByStartTime = async (
  user: JwtPayload,
  pagination: IPaginationOptions
) => {
  const { page, skip, limit, sortBy, sortOrder } = paginationHelper.calculatePagination(pagination);

  const now = new Date();
  const whereConditions = {
    createdBy: user.authId,
    date: { $lte: now },
    endDate: { $gte: now }
  };



  const [result, total] = await Promise.all([
    Plan.find(whereConditions).populate('createdBy')
      .skip(skip)
      .limit(limit)
      .sort({ [sortBy]: sortOrder })
      .populate('activities')
      .populate('friends'),
    Plan.countDocuments(whereConditions),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: result,
  };
};

const searchPlaces = async (query: ISearchQuery): Promise<ISearchResult[]> => {
  const { searchTerm, location, address, category, dateFilter, startDate, endDate } = query;

  if (!config.serp_api_key) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'SerpAPI key is not configured');
  }

  try {
    // Build the query string - combine available information
    const queryParts = [];
    if (searchTerm) queryParts.push(searchTerm);
    if (category) queryParts.push(category);
    if (address) queryParts.push(address);
    if (location && !address) queryParts.push(location);

    const searchQuery = queryParts.length > 0 ? queryParts.join(' ') : 'Events';

    const params: any = {
      engine: 'google_events',
      q: searchQuery,
      api_key: config.serp_api_key,
    };

    if (location) {
      params.location = location;
    }

    // Add filters for SerpAPI using htichips (Google Events specific)
    const filters: string[] = [];
    if (dateFilter && dateFilter !== 'range') {
      filters.push(`date:${dateFilter}`);
    } else if (dateFilter === 'range' && startDate && endDate) {
      filters.push(`date:range:${startDate},${endDate}`);
    }

    if (filters.length > 0) {
      params.htichips = filters.join(',');
    }

    const response: any = await getJson(params);

    if (!response.events_results || response.events_results.length === 0) {
      return [];
    }

    const searchResults: ISearchResult[] = response.events_results.map((event: any) => {
      // Logic for extracting rating and reviews more robustly
      const rating = event.rating?.rating || event.rating || event.event_rating?.rating || event.event_rating;
      const reviews = event.rating?.reviews || event.reviews || event.event_rating?.reviews || event.user_ratings_total;

      return {
        title: event.title,
        address: event.address?.join(', ') || event.address,
        latitude: undefined,
        longitude: undefined,
        thumbnail: event.thumbnail,
        link: event.link,
        rating: typeof rating === 'number' ? rating : (rating ? parseFloat(rating) : undefined),
        reviews: typeof reviews === 'number' ? reviews : (reviews ? parseInt(reviews) : undefined),
        category: category || (event.title?.toLowerCase().includes('food') ? 'Food and Coffee' : undefined),
        date: {
          start: event.date?.start_date,
          when: event.date?.when,
        },
        venue: event.venue ? {
          name: event.venue.name,
          link: event.venue.link,
        } : undefined,
      };
    });

    return searchResults;
  } catch (error: any) {
    console.error('SerpAPI Error:', error);
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      `Failed to search events: ${error.message || 'Unknown error'}`
    );
  }
};

export const PlanServices = {
  createPlan,
  getAllPlans,
  getSinglePlan,
  updatePlan,
  deletePlan,
  removePlanFriend,
  getPlansByStartTime,
  searchPlaces
};
import { Request, Response } from "express";
import Unit from "../models/Unit";
import User from "src/models/User";

export const createUnit = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { number, floor, squareFootage, type, owner, parkingSpots, tenant } =
      req.body;

    if (!number || !squareFootage || !type || !owner) {
      res.status(400).json({
        error:
          "Missing required fields: number, squareFootage, type, and owner are mandatory.",
      });
      return;
    }

    const validTypes = [
      "Residential",
      "Commercial",
      "House",
      "Apartment",
      "Office",
    ];
    if (!validTypes.includes(type)) {
      res.status(400).json({
        error: `Invalid unit type. Valid types are: ${validTypes.join(", ")}`,
      });
      return;
    }

    const ownerExists = await User.find({ _id: { $in: owner } });
    if (ownerExists.length !== owner.length) {
      res.status(400).json({ error: "One or more owners do not exist." });
      return;
    }

    if (tenant && tenant.length > 0) {
      const tenantExists = await User.find({ _id: { $in: tenant } });
      if (tenantExists.length !== tenant.length) {
        res.status(400).json({ error: "One or more tenants do not exist." });
        return;
      }
    }

    const newUnit = new Unit({
      number,
      floor,
      squareFootage,
      type,
      owner,
      parkingSpots,
      tenant,
    });

    const savedUnit = await newUnit.save();
    res.status(201).json(savedUnit);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create unit" });
  }
};

export const getUnits = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      search,
      type,
      floor,
      page = 1,
      limit = 10,
      sortField,
      sortOrder,
    } = req.query;

    const query: any = {};

    if (search) {
      const normalizedSearch = (search as string)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      const regex = new RegExp(normalizedSearch, "i");
      query.$or = [{ number: regex }, { type: regex }];
    }

    if (type && type !== "undefined") {
      query.type = type;
    }

    if (floor && !isNaN(Number(floor))) {
      query.floor = Number(floor);
    }

    const pageNumber = parseInt(page as string, 10) || 1;
    const limitNumber = parseInt(limit as string, 10) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    const sort: any = {};
    if (sortField) {
      sort[sortField as string] = sortOrder === "desc" ? -1 : 1;
    } else {
      sort["createdAt"] = -1;
    }

    const units = await Unit.find(query)
      .populate("owner tenant")
      .sort(sort)
      .skip(skip)
      .limit(limitNumber);

    const totalUnits = await Unit.countDocuments(query);

    res.status(200).json({
      units,
      totalUnits,
      totalPages: Math.ceil(totalUnits / limitNumber),
      currentPage: pageNumber,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch units" });
  }
};

export const getUnitById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const unit = await Unit.findById(id).populate("owner tenant");

    if (!unit) {
      res.status(404).json({ error: "Unit not found" });
      return;
    }

    res.status(200).json(unit);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch unit" });
  }
};

export const deleteUnit = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const unit = await Unit.findById(id);
    if (!unit) {
      res.status(404).json({ error: "Unit not found." });
      return;
    }

    await Unit.findByIdAndDelete(id);

    res.status(200).json({ message: "Unit deleted successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete unit." });
  }
};

export const updateUnit = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { number, floor, squareFootage, type, owner, parkingSpots, tenant } =
      req.body;

    const unit = await Unit.findById(id);
    if (!unit) {
      res.status(404).json({ error: "Unit not found." });
      return;
    }

    if (owner && owner.length > 0) {
      const ownerExists = await User.find({ _id: { $in: owner } });
      if (ownerExists.length !== owner.length) {
        res.status(400).json({ error: "One or more owners do not exist." });
        return;
      }
    }

    if (tenant && tenant.length > 0) {
      const tenantExists = await User.find({ _id: { $in: tenant } });
      if (tenantExists.length !== tenant.length) {
        res.status(400).json({ error: "One or more tenants do not exist." });
        return;
      }
    }

    const updatedUnit = await Unit.findByIdAndUpdate(
      id,
      {
        number,
        floor,
        squareFootage,
        type,
        owner,
        parkingSpots,
        tenant,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedUnit);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update unit." });
  }
};
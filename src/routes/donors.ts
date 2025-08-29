import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { auth, AuthedRequest } from "../utils/auth.js";
import { z } from "zod";

const prisma = new PrismaClient();
const router = Router();

const donorCreateSchema = z.object({
  fullName: z.string().min(2),
  bloodGroup: z.enum(["A+","A-","B+","B-","AB+","AB-","O+","O-"]),
  donationTypes: z.array(z.enum(["blood","platelets","plasma"])),
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
  city: z.string().optional(),
  state: z.string().optional()
});

router.post("/", auth(["DONOR","ADMIN"]), async (req: AuthedRequest, res) => {
  const parsed = donorCreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());
  const data = parsed.data;
  const donor = await prisma.donor.create({
    data: { userId: req.user!.id, fullName: data.fullName, bloodGroup: data.bloodGroup, donationTypes: data.donationTypes, lat: data.lat, lon: data.lon, city: data.city, state: data.state }
  });
  res.status(201).json(donor);
});

router.get("/me", auth(["DONOR","ADMIN"]), async (req: AuthedRequest, res) => {
  const donor = await prisma.donor.findUnique({ where: { userId: req.user!.id } });
  if (!donor) return res.status(404).json({ error: "Profile not found" });
  res.json(donor);
});

export default router;

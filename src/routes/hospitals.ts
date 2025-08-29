import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { auth, AuthedRequest } from "../utils/auth.js";
import { z } from "zod";

const prisma = new PrismaClient();
const router = Router();

const hospitalSchema = z.object({
  name: z.string().min(2),
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional()
});

router.post("/", auth(["HOSPITAL","ADMIN"]), async (req: AuthedRequest, res) => {
  const parsed = hospitalSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());
  const data = parsed.data;
  const hospital = await prisma.hospital.create({
    data: { userId: req.user!.id, name: data.name, lat: data.lat, lon: data.lon, address: data.address, city: data.city, state: data.state }
  });
  res.status(201).json(hospital);
});

router.get("/me", auth(["HOSPITAL","ADMIN"]), async (req: AuthedRequest, res) => {
  const hospital = await prisma.hospital.findUnique({ where: { userId: req.user!.id } });
  if (!hospital) return res.status(404).json({ error: "Profile not found" });
  res.json(hospital);
});

export default router;

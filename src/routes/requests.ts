import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { auth, AuthedRequest } from "../utils/auth.js";
import { z } from "zod";
import { compatibleBloodGroups, haversine, daysSince } from "../utils/match.js";

const prisma = new PrismaClient();
const router = Router();

const createSchema = z.object({
  requestType: z.enum(["blood","platelets","plasma"]),
  bloodGroup: z.enum(["A+","A-","B+","B-","AB+","AB-","O+","O-"]),
  unitsNeeded: z.number().int().positive(),
  urgency: z.enum(["LOW","MEDIUM","HIGH","CRITICAL"]),
  requiredBy: z.string().datetime().optional(),
  radiusKm: z.number().positive().max(500).default(25),
  notes: z.string().optional()
});

router.post("/", auth(["HOSPITAL","ADMIN"]), async (req: AuthedRequest, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());
  const hospital = await prisma.hospital.findUnique({ where: { userId: req.user!.id } });
  if (!hospital) return res.status(400).json({ error: "Hospital profile missing" });
  const reqData = await prisma.donorRequest.create({
    data: { hospitalId: hospital.id, ...parsed.data }
  });
  res.status(201).json(reqData);
});

router.get("/:id/matches", auth(["HOSPITAL","ADMIN"]), async (req: AuthedRequest, res) => {
  const request = await prisma.donorRequest.findUnique({ where: { id: req.params.id }, include: { hospital: true } });
  if (!request) return res.status(404).json({ error: "Not found" });

  const compatible = compatibleBloodGroups(request.bloodGroup);
  const donors = await prisma.donor.findMany({
    where: {
      active: true, verified: true,
      bloodGroup: { in: compatible },
      donationTypes: { has: request.requestType }
    },
    take: 100
  });

  const scored = donors.map(d => ({
    donor: d,
    distanceKm: haversine(d.lat, d.lon, request.hospital.lat, request.hospital.lon),
    recencyDays: daysSince(d.lastDonationAt as any)
  }))
  .filter(x => x.distanceKm <= (request.radiusKm ?? 25))
  .map(x => ({ 
    ...x, 
    score: 100 - x.distanceKm - Math.min(x.recencyDays, 90)/9 
  }))
  .sort((a,b) => b.score - a.score)
  .slice(0, 25);

  res.json(scored);
});

export default router;

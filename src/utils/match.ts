export function compatibleBloodGroups(reqGroup: string): string[] {
  const map: Record<string,string[]> = {
    "O-": ["O-"],
    "O+": ["O-","O+"],
    "A-": ["O-","A-"],
    "A+": ["O-","O+","A-","A+"],
    "B-": ["O-","B-"],
    "B+": ["O-","O+","B-","B+"],
    "AB-": ["O-","A-","B-","AB-"],
    "AB+": ["O-","O+","A-","A+","B-","B+","AB-","AB+"]
  };
  return map[reqGroup] ?? [];
}

const R = 6371; // km
export function haversine(lat1:number, lon1:number, lat2:number, lon2:number) {
  const toRad = (d:number)=>d*Math.PI/180;
  const dLat = toRad(lat2-lat1), dLon = toRad(lon2-lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
  return 2*R*Math.asin(Math.sqrt(a));
}
export function daysSince(isoDate?: string | Date | null){
  if (!isoDate) return 9999;
  const t = typeof isoDate === "string" ? new Date(isoDate).getTime() : isoDate.getTime();
  return Math.floor((Date.now() - t)/86400000);
}

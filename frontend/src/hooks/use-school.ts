import { useQuery } from "@tanstack/react-query";
import { schoolService } from "@/services/school-service";

export function useSchool() {
  return useQuery({
    queryKey: ["school-profile"],
    queryFn: () => schoolService.get(),
  });
}

// Public variant (no auth) for landing & login pages
export function useSchoolPublic() {
  return useQuery({
    queryKey: ["school-profile-public"],
    queryFn: () => schoolService.getPublic(),
    staleTime: 5 * 60 * 1000,
  });
}

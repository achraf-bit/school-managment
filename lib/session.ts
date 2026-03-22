import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { AppError } from "./errors";

export async function getSession() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
  }

  return session;
}

export async function getSchoolId() {
  const session = await getSession();
  const schoolId = (session.user as any).schoolId;
  
  if (!schoolId) {
    throw new AppError("School ID not found", 401, "SCHOOL_ID_MISSING");
  }

  return schoolId;
}

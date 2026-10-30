import Bootcamp from "./model";

type EnrollResult =
  | { ok: true; bootcamp: any }
  | { ok: false; status: number; message: string };

// Shared by the HTTP enroll-member route and the checkout flow
// (createTransaction free path, M-Pesa callback paid path) so bootcamp
// enrollment is only implemented once.
export const enrollMemberInBootcampCore = async (
  bootcampId: string,
  memberId: string,
  fullName: string
): Promise<EnrollResult> => {
  const bootcamp = await Bootcamp.findById(bootcampId);
  if (!bootcamp) {
    return { ok: false, status: 404, message: "Bootcamp not found" };
  }

  if (bootcamp.enrollmentStatus !== "Open") {
    return { ok: false, status: 400, message: "Enrollment is closed for this bootcamp" };
  }

  const memberExists = bootcamp.members.some((m: any) => m.memberId === memberId);
  if (memberExists) {
    return { ok: false, status: 400, message: "Member already enrolled in this bootcamp" };
  }

  bootcamp.members.push({
    memberId,
    fullName,
    progress: 0,
  });

  await bootcamp.save();

  return { ok: true, bootcamp };
};

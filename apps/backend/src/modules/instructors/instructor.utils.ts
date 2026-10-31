// Aggregates a teacher's course + bootcamp documents into directory-facing
// stats. Computed at request time (no denormalized/cached field) — mirrors
// how course.ratings is already recomputed on every addReview call.

export interface TeacherStats {
  studentCount: number;
  avgRating: number;
  categories: string[];
}

export const aggregateTeacherStats = (courses: any[], bootcamps: any[]): TeacherStats => {
  let ratingSum = 0;
  let ratingWeight = 0;
  const studentIds = new Set<string>();
  const categories = new Set<string>();

  for (const course of courses) {
    const reviewCount = course.reviews?.length ?? 0;
    if (reviewCount > 0 && typeof course.ratings === "number") {
      ratingSum += course.ratings * reviewCount;
      ratingWeight += reviewCount;
    }
    (course.enrollments ?? []).forEach((enrollment: any) => {
      if (enrollment?.userId) studentIds.add(enrollment.userId);
    });
    if (course.category) categories.add(course.category);
  }

  for (const bootcamp of bootcamps) {
    // Prefer the stored averageRating/reviewCount pair; fall back to
    // deriving from testimonials when reviewCount hasn't been populated.
    let bootcampReviewCount = bootcamp.reviewCount ?? 0;
    let bootcampAvgRating = bootcamp.averageRating ?? 0;

    if (bootcampReviewCount === 0 && Array.isArray(bootcamp.testimonials)) {
      const rated = bootcamp.testimonials.filter((t: any) => typeof t.rating === "number");
      if (rated.length > 0) {
        bootcampReviewCount = rated.length;
        bootcampAvgRating = rated.reduce((sum: number, t: any) => sum + t.rating, 0) / rated.length;
      }
    }

    if (bootcampReviewCount > 0) {
      ratingSum += bootcampAvgRating * bootcampReviewCount;
      ratingWeight += bootcampReviewCount;
    }

    (bootcamp.members ?? []).forEach((member: any) => {
      if (member?.memberId) studentIds.add(member.memberId);
    });
    (bootcamp.categories ?? []).forEach((category: string) => categories.add(category));
  }

  return {
    studentCount: studentIds.size,
    avgRating: ratingWeight > 0 ? ratingSum / ratingWeight : 0,
    categories: [...categories],
  };
};

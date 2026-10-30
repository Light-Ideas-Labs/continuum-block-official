declare global {
  interface PaymentMethod {
    methodId: string;
    type: string;
    lastFour: string;
    expiry: string;
  }

  interface UserSettings {
    theme?: "light" | "dark";
    emailAlerts?: boolean;
    smsAlerts?: boolean;
    courseNotifications?: boolean;
    notificationFrequency?: "immediate" | "daily" | "weekly";
  }

  interface User {
    userId: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    email: string;
    publicMetadata: { 
      userType: "teacher" | "student";
    };
    privateMetadata: {
      settings?: UserSettings;
      paymentMethods?: Array<PaymentMethod>;
      defaultPaymentMethodId?: string;
      stripeCustomerId?: string;
    };
    unsafeMetadata: {
      bio?: string;
      urls?: string[];
    };
  }

  interface Course {
    _id: string;
    teacherId: string;
    teacherName: string;
    title: string;
    description?: string;
    category: string;
    image?: string;
    price?: number; // Stored in cents (e.g., 4999 for $49.99)
    level: "Beginner" | "Intermediate" | "Advanced";
    status: "Draft" | "Published";
    sections: Section[];
    enrollments?: Array<{
      userId: string;
    }>;
  }

  interface InstructorSummary {
    teacherId: string;
    name: string;
    imgUrl?: string;
    courseCount: number;
    bootcampCount: number;
    studentCount: number;
    avgRating: number;
    categories: string[];
  }

  interface InstructorDetail extends InstructorSummary {
    courses: Course[];
    bootcamps?: Array<{
      _id: string;
      title: string;
      image?: string;
    }>;
  }

  interface TeacherStudent {
    transactionId: string;
    userId: string;
    firstName?: string | null;
    lastName?: string | null;
    email?: string;
    imgUrl?: string;
    purchaseTitle?: string;
    purchaseImage?: string;
    purchaseType?: "Course" | "Bootcamp";
    status?: "Pending" | "AwaitingVerification" | "Completed" | "Failed" | "Refunded";
    amount?: number;
    currency?: string;
    paymentProvider?: "Free" | "Stripe" | "M-Pesa" | "M-Pesa-PayBill" | "Co-op-Bank" | "PayPal" | "Flutterwave";
    dateTime?: string;
 }

  interface Transaction {
    _id: string;
    userId: string;
    courseId: string;
    bootcampId?: string;

    amount: number; // Stored in cents
    currency: string;

    transactionId: string;
    dateTime: string;

    paymentProvider: "Free" | "Stripe" | "M-Pesa" | "M-Pesa-PayBill" | "Co-op-Bank" | "PayPal" | "Flutterwave";
    status: "Pending" | "AwaitingVerification" | "Completed" | "Failed" | "Refunded";
    paymentReference?: string;
    paymentMethodId?: string;
    savePaymentMethod?: boolean;

    createdAt: string;
    updatedAt: string;
  }

  interface DateRange {
    from: string | undefined;
    to: string | undefined;
  }

  interface CourseProgress {
    userId: string;
    courseId: string;
    enrollmentDate: string;
    overallProgress: number;
    sections: SectionProgress[];
    totalPoints?: number;
    totalPrize?: number;
    lastAccessedTimestamp: string;
    completionStatus?: string;
    badges?: string[];
    engagementScore?: number;
  }

  interface LeaderboardEntry {
    userId: string;
    rank: number;
    overallProgress: number;
    courseCount?: number;
    totalPoints?: number;
    totalPrize?: number;
  }

  interface TopUser {
    rank: number;
    userId: string;
    totalPoints: number;
    totalPrize: number;
  }

  interface SectionProgress {
    sectionId: string;
    chapters: ChapterProgress[];
  }
  
  interface ChapterProgress {
    chapterId: string;
    completed: boolean;
  }

  type CreateUserArgs = Omit<User, "userId">;
  type CreateCourseArgs = Omit<Course, "courseId">;
  type CreateTransactionArgs = Omit<Transaction, "transactionId">;

  interface CourseCardProps {
    course: Course;
    onGoToCourse: (course: Course) => void;
  }

  interface TeacherCourseCardProps {
    course: Course;
    onEdit: (course: Course) => void;
    onDelete: (course: Course) => void;
    isOwner: boolean;
  }

  interface Comment {
    id: string;
    userId: string;
    text: string;
    timestamp: string;
  }

  interface Homework {
    id: string;
    title: string;
    description: string;
    dueDate: string;
    submissions?: Array<{
      userId: string;
      submissionDate: string;
      status: "Submitted" | "Graded";
    }>;
  }

  interface Chapter {
    chapterId: string;
    title: string;
    content: string;
    video?: string | File;
    quiz?: BackendQuizQuestion[];
    freePreview?: boolean;
    type: "Text" | "Quiz" | "Video";
    comments?: Comment[];
    homeworks?: Homework[];
  }

  interface SectionProgress {
    sectionId: string;
    chapters: ChapterProgress[];
  }

  interface Section {
    sectionId: string;
    sectionTitle: string;
    sectionDescription?: string;
    chapters: Chapter[];
  }

  interface WizardStepperProps {
    currentStep: number;
  }

  interface AccordionSectionsProps {
    sections: Section[];
  }

  interface SearchCourseCardProps {
    course: Course;
    isSelected?: boolean;
    onClick?: () => void;
  }

  interface CoursePreviewProps {
    course: Course;
  }

  interface CustomFixedModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
  }

  interface HeaderProps {
    title: string;
    subtitle: string;
    rightElement?: ReactNode;
  }

  interface SharedNotificationSettingsProps {
    title?: string;
    subtitle?: string;
  }

  interface ToolbarProps {
    onSearch: (search: string) => void;
    onCategoryChange: (category: string) => void;
  }

  interface ChapterModalProps {
    isOpen: boolean;
    onClose: () => void;
    sectionIndex: number | null;
    chapterIndex: number | null;
    sections: Section[];
    setSections: React.Dispatch<React.SetStateAction<Section[]>>;
    courseId: string;
  }

  interface SectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    sectionIndex: number | null;
    sections: Section[];
    setSections: React.Dispatch<React.SetStateAction<Section[]>>;
  }

  interface DroppableComponentProps {
    sections: Section[];
    setSections: (sections: Section[]) => void;
    handleEditSection: (index: number) => void;
    handleDeleteSection: (index: number) => void;
    handleAddChapter: (sectionIndex: number) => void;
    handleEditChapter: (sectionIndex: number, chapterIndex: number) => void;
    handleDeleteChapter: (sectionIndex: number, chapterIndex: number) => void;
  }

  interface CourseFormData {
    courseTitle: string;
    courseDescription: string;
    courseLevel: string;
    courseCategory: string;
    coursePrice: string;
    courseStatus: boolean;
    courseImage: string | File;
    sections: Section[];
    quizzes?: Quiz[];
  }

  interface BackendQuizQuestion {
    questionId: string;
    text: string;
    options: { 
      optionId: string; text: string; 
      isCorrect: boolean 
    }[];
  }
  interface FrontendQuizQuestion {
    id: string;
    question: string;
    options: { label: string; value: string }[];
    correctAnswer: string;
  }
  
  interface Quiz {
    id: string;
    chapterId: string;
    questions: FrontendQuizQuestion[];
  }


 interface BootcampTestimonial {
    id: string;
    author: {
      name: string;
      username: string;
      profileImageUrl?: string;
    };
    text: string;
    rating?: number;
    date: string;
  }


  interface BootcampCardProps {
    bootcamp: Bootcamp;
    onGoToBootcamp: (bootcamp: Bootcamp) => void;
  }
  
  interface BootcampPreviewProps {
    bootcamp: Bootcamp;
  }

  interface Bootcamp {
    _id: string;
    hostedBy: {
      type: "Organization" | "Individual";
      name: string;
      id: string;
    };
    title: string;
    description: string;
    startDate: Date | string;
    duration: string;
    type: "Full-Time" | "Part-Time";
    deliveryMode: "Online" | "In-Person" | "Hybrid";
    liveClasses: {
      count: number;
      description: string;
      schedule: Array<{
        date: string;
        title: string;
        description?: string;
      }>;
    };
    practicalCaseStudy: string;
    weeklyFeedback: string;
    certification: string;
    enrollmentStatus: "Open" | "Closed";
    courses: { courseId: string; title: string }[];
    members: { memberId: string; fullName: string; progress: number }[];
    testimonials: BootcampTestimonial[];
    price: {
      amount: number;
      currency: string;
    };
    categories: string[];
    averageRating?: number;
    reviewCount?: number;
    prerequisites?: string;
    updatedAt: Date;
    createdBy: string;
    image?: string; // Optional image field
    status: "Draft" | "Published";
  }
  
  interface TeacherBootcampCardProps {
    bootcamp: Bootcamp;
    onEdit: (bootcamp: Bootcamp) => void;
    onDelete: (bootcamp: Bootcamp) => void;
    isOwner: boolean;
  }

  interface BootcampFormData {
    title: string;
    startDate: Date;
    description: string;
    duration: string;
    type: boolean;
    liveClasses: {
      count: number;
      description: string;
    };
    practicalCaseStudy: string;
    weeklyFeedback: string;
    certification: string;
    enrollmentStatus: boolean;
    image?: string | File;
    status: boolean;
    courses?: { courseId: string; title: string }[];
    members?: { memberId: string; fullName: string; progress: number }[];
    testimonials?: { testimonialId: string; name: string; content: string }[];
    price: {
      amount: number;
      currency: string;
    };
    paymentPlans?: { amount: number; currency: string; duration: string }[];
    categories?: string[];
    averageRating?: number;
    reviewCount?: number;
    prerequisites?: string;
    leaderboard?: { memberId: string; fullName: string; progress: number }[];
  }

  interface BootcampModule {
    moduleId: string;
    moduleTitle: string;
    moduleDescription?: string;
    items: ModuleItem[];
  }

  interface ModuleItem {
    itemId: string;
    title: string;
    content?: string;
    type?: "Live" | "CaseStudy" | "Feedback";
  }
  interface SearchBootcampCardProps {
    bootcamp: {
      _id: string;
      hostedBy: {
        type: "Organization" | "Individual";
        name: string;
        id: string;
      };
      title: string;
      image?: string;
      type?: "Full-Time" | "Part-Time";
      practicalCaseStudy?: string;
      duration?: string;
      members?: { memberId: string }[];
    };
    isSelected?: boolean;
    onClick: () => void;
  }

}

export {};

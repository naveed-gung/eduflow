
export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  category: string;
  thumbnailUrl: string;
  duration: string;
  lessonsCount: number;
  price: number;
  progress?: number;
  isPopular?: boolean;
  isNew?: boolean;
  isPublished?: boolean;
  createdAt: string;
}

export const mockCourses: Course[] = [
  {
    id: "1",
    title: "Quantum Programming Fundamentals",
    description: "Learn the basics of quantum computing and programming with practical examples.",
    instructor: "Dr. Sarah Chen",
    category: "Programming",
    thumbnailUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb",
    duration: "6 hours",
    lessonsCount: 24,
    price: 49.99,
    progress: 75,
    isPopular: true,
    isPublished: true,
    createdAt: "2023-01-15",
  },
  {
    id: "2",
    title: "Advanced Neural Networks",
    description: "Dive deep into neural networks with TensorFlow and PyTorch implementations.",
    instructor: "Prof. Michael Johnson",
    category: "AI & ML",
    thumbnailUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485",
    duration: "8 hours",
    lessonsCount: 32,
    price: 79.99,
    progress: 45,
    isPopular: true,
    isPublished: true,
    createdAt: "2023-02-10",
  },
  {
    id: "3",
    title: "UI/UX Design Masterclass",
    description: "Comprehensive guide to creating stunning user interfaces and experiences.",
    instructor: "Lisa Parker",
    category: "Design",
    thumbnailUrl: "https://images.unsplash.com/photo-1626785774573-4b799315345d",
    duration: "10 hours",
    lessonsCount: 42,
    price: 59.99,
    progress: 90,
    isNew: true,
    isPublished: true,
    createdAt: "2023-03-21",
  },
  {
    id: "4",
    title: "Blockchain Development with Solidity",
    description: "Build decentralized applications using Ethereum and Solidity.",
    instructor: "Alex Morgan",
    category: "Blockchain",
    thumbnailUrl: "https://images.unsplash.com/photo-1639322537228-f710d846310a",
    duration: "7 hours",
    lessonsCount: 28,
    price: 69.99,
    progress: 30,
    isNew: true,
    isPublished: true,
    createdAt: "2023-04-05",
  },
  {
    id: "5",
    title: "Cybersecurity: Ethical Hacking",
    description: "Learn ethical hacking techniques to secure systems and networks.",
    instructor: "Robert Wilson",
    category: "Security",
    thumbnailUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5",
    duration: "9 hours",
    lessonsCount: 36,
    price: 89.99,
    isPopular: true,
    isPublished: true,
    createdAt: "2023-05-18",
  },
  {
    id: "6",
    title: "Mobile App Development with Flutter",
    description: "Create cross-platform mobile apps with Flutter and Dart.",
    instructor: "Emma Davis",
    category: "Mobile",
    thumbnailUrl: "https://images.unsplash.com/photo-1617040619263-41c5a9ca7521",
    duration: "12 hours",
    lessonsCount: 48,
    price: 69.99,
    isNew: true,
    isPublished: false,
    createdAt: "2023-06-22",
  },
  {
    id: "7",
    title: "Cloud Architecture on AWS",
    description: "Master cloud architecture principles using Amazon Web Services.",
    instructor: "James Miller",
    category: "Cloud",
    thumbnailUrl: "https://images.unsplash.com/photo-1603695762547-fba8b92ebd77",
    duration: "8 hours",
    lessonsCount: 32,
    price: 79.99,
    isPublished: true,
    createdAt: "2023-07-14",
  },
  {
    id: "8",
    title: "Data Science and Visualization",
    description: "Extract insights from data with Python, pandas, and interactive visualizations.",
    instructor: "Dr. Olivia Brown",
    category: "Data Science",
    thumbnailUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71",
    duration: "11 hours",
    lessonsCount: 44,
    price: 69.99,
    isPopular: true,
    isPublished: true,
    createdAt: "2023-08-29",
  },
];

export const getFeaturedCourses = () => {
  return mockCourses.filter(course => course.isPopular || course.isNew).slice(0, 3);
};

export const getPopularCourses = () => {
  return mockCourses.filter(course => course.isPopular);
};

export const getNewCourses = () => {
  return mockCourses.filter(course => course.isNew);
};

export const getEnrolledCourses = () => {
  return mockCourses.slice(0, 4).map(course => ({
    ...course,
    progress: Math.floor(Math.random() * 100)
  }));
};

export const getAdminCourses = () => {
  return mockCourses.map(course => ({
    ...course,
    students: Math.floor(Math.random() * 500) + 50,
    revenue: Math.floor(Math.random() * 10000) + 1000,
  }));
};

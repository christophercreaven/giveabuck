export type Role = 'DONOR' | 'STUDENT' | 'ADMIN';
export type ScholarshipStatus = 'OPEN' | 'VOTING' | 'FUNDED' | 'CLOSED';
export type ApplicationStatus = 'PENDING' | 'UNDER_REVIEW' | 'SELECTED' | 'REJECTED';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  school?: string;
  major?: string;
  bio?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Scholarship {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  raisedAmount: number;
  school?: string;
  fieldOfStudy?: string;
  creatorId: string;
  creator: Pick<User, 'id' | 'name' | 'avatarUrl'>;
  status: ScholarshipStatus;
  deadline?: string;
  createdAt: string;
  _count?: { donations: number; applications: number };
  donations?: Donation[];
  applications?: Application[];
  comments?: Comment[];
}

export interface Donation {
  id: string;
  amount: number;
  donorId: string;
  donor?: Pick<User, 'id' | 'name' | 'avatarUrl'>;
  scholarshipId: string;
  scholarship?: Pick<Scholarship, 'id' | 'title' | 'school'>;
  anonymous: boolean;
  message?: string;
  createdAt: string;
}

export interface Application {
  id: string;
  studentId: string;
  student?: Pick<User, 'id' | 'name' | 'avatarUrl'>;
  scholarshipId: string;
  scholarship?: Pick<Scholarship, 'id' | 'title' | 'status'>;
  essay: string;
  gpa?: number;
  major: string;
  school: string;
  status: ApplicationStatus;
  createdAt: string;
  _count?: { votes: number };
}

export interface Comment {
  id: string;
  userId: string;
  user: Pick<User, 'id' | 'name' | 'avatarUrl'>;
  text: string;
  createdAt: string;
}

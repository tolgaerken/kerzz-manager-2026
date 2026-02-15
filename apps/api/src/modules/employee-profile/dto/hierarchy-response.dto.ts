/**
 * Hiyerarşi node'u - tek bir çalışan ve alt çalışanları
 */
export interface HierarchyNodeDto {
  userId: string;
  userName: string;
  userEmail: string;
  employeeNumber: string;
  departmentCode: string;
  departmentName: string;
  titleCode: string;
  titleName: string;
  location: string;
  employmentStatus: string;
  level: number;
  subordinates: HierarchyNodeDto[];
}

/**
 * Hiyerarşi response DTO
 */
export interface HierarchyResponseDto {
  root: HierarchyNodeDto;
  totalCount: number;
}

/**
 * Flat hiyerarşi node'u (tree olmadan)
 */
export interface FlatHierarchyNodeDto {
  userId: string;
  userName: string;
  userEmail: string;
  employeeNumber: string;
  departmentCode: string;
  departmentName: string;
  titleCode: string;
  titleName: string;
  location: string;
  employmentStatus: string;
  managerUserId: string;
  managerName: string;
  level: number;
}

/**
 * Flat hiyerarşi response DTO
 */
export interface FlatHierarchyResponseDto {
  data: FlatHierarchyNodeDto[];
  totalCount: number;
}

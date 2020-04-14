export interface Courses {
    id: string;
    name: string;
    subCourses: subCourses[];
}
export interface subCourses {
    id: string;
    name: string;
    description: string;
    index_url: string;
}
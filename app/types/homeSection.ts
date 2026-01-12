// Define the types for home section data
export interface HeroSection {
    id: number;
    user_id: number;
    section: string;
    title: string;
    content: string;
    description: string;
    hero_type: string;
    image: string | null;
    tags: string | null;
    video: string | null;
    slider_files: string[] | null;
    created_at: string;
    updated_at: string;
}

export interface SecondarySection {
    id: number;
    user_id: number;
    section: string;
    title: string;
    content: string;
    description: string;
    hero_type: string;
    image: string | null;
    tags: string | null;
    video: string | null;
    slider_files: string[] | null;
    created_at: string;
    updated_at: string;
}

export interface SubCategory {
    sub_category_id: number;
    sub_category_name: string;
    sub_category_image: string;
}

export interface HomeSectionData {
    hero: HeroSection;
    secondary: SecondarySection;
    sub_category_list: SubCategory[];
}

export interface HomeSectionResponse {
    success: boolean;
    status: number;
    message: string;
    data: HomeSectionData;
}

// Define the initial state interface
export interface HomeSectionState {
    homeSection: HomeSectionData | null;
    loading: boolean;
    error: string | null;
}
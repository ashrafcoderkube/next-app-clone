// Define the types for about section data
export interface AboutSectionData {
    id: number;
    user_id: number;
    content: string;
    created_at: string;
    updated_at: string;
}

export interface AboutSectionResponse {
    success: boolean;
    status: number;
    message: string;
    data: AboutSectionData;
}

// Define the initial state interface
export interface AboutSectionState {
    aboutSection: AboutSectionData | null;
    loading: boolean;
    error: string | null;
}


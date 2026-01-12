// Define the types for terms of use data
export interface TermsOfUseData {
    content: string;
}

export interface TermsOfUseResponse {
    success: boolean;
    status: number;
    message: string;
    data: TermsOfUseData;
}

// Define the initial state interface
export interface TermsOfUseState {
    termsOfUse: TermsOfUseData | null;
    loading: boolean;
    error: string | null;
}


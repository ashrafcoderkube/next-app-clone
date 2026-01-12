// Define the types for privacy policy data
export interface PrivacyPolicyData {
    content: string;
}

export interface PrivacyPolicyResponse {
    success: boolean;
    status: number;
    message: string;
    data: PrivacyPolicyData;
}

// Define the initial state interface
export interface PrivacyPolicyState {
    privacyPolicy: PrivacyPolicyData | null;
    loading: boolean;
    error: string | null;
}


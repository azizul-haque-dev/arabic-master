import { api } from "@/lib/axios";
import type {
    AiGenerationStatus,
    ApiResponse,
    ArabicTextEntry,
    Status,
    PaginatedData,
} from "@/types";

export interface ListArabicTextsParams {
    page?: number;
    limit?: number;
    status?: Status;
    aiStatus?: AiGenerationStatus;
    search?: string;
}

export interface ArabicTextInput {
    text: string;
    audioUrl?: string;
    pronunciationEn?: string;
    pronunciationBn?: string;
    meaningEn?: string;
    meaningBn?: string;
    whenToUseEn?: string;
    whenToUseBn?: string;
    feminineEn?: string;
    feminineBn?: string;
    status?: Status;
    aiStatus?: AiGenerationStatus;
}

export interface GenerateArabicTextResponse {
    arabicTextId: string;
    aiStatus: AiGenerationStatus;
}

export async function fetchArabicTexts(
    params: ListArabicTextsParams,
): Promise<PaginatedData<ArabicTextEntry>> {
    const { data } = await api.get<ApiResponse<PaginatedData<ArabicTextEntry>>>(
        "/arabic-texts",
        { params },
    );
    return data.data;
}

export async function fetchArabicText(id: string): Promise<ArabicTextEntry> {
    const { data } = await api.get<ApiResponse<ArabicTextEntry>>(
        `/arabic-texts/${id}`,
    );
    return data.data;
}

export async function createArabicText(
    input: ArabicTextInput,
): Promise<ArabicTextEntry> {
    const { data } = await api.post<ApiResponse<ArabicTextEntry>>(
        "/arabic-texts",
        input,
    );
    return data.data;
}

export async function updateArabicText(
    id: string,
    input: Partial<ArabicTextInput>,
): Promise<ArabicTextEntry> {
    const { data } = await api.patch<ApiResponse<ArabicTextEntry>>(
        `/arabic-texts/${id}`,
        input,
    );
    return data.data;
}

export async function deleteArabicText(id: string): Promise<void> {
    await api.delete(`/arabic-texts/${id}`);
}

// Kicks off async AI enrichment. Backend returns 202 immediately;
// aiStatus starts at PENDING and updates in the background.
export async function generateArabicText(
    text: string,
): Promise<GenerateArabicTextResponse> {
    const { data } = await api.post<ApiResponse<GenerateArabicTextResponse>>(
        "/arabic-texts/ai",
        { text },
    );
    return data.data;
}
import type { Level, Pos } from '../services/studySetService';

export interface Vocabulary {
    id: number;
    term: string;
    definition: string;
    baseForm?: string;
    base_form?: string;
    ipa?: string;
    audioUrl?: string;
    audio_url?: string;
    pos?: Pos | string;
    level?: Level | string;
    meaning?: string;
    hint?: string;
    example?: string;
    createAt?: string;
    create_at?: string;
    createdAt?: string;
    isDel?: boolean;
}
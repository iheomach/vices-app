import { SubstanceType } from './tracking';
export interface Goal {
    id: string;
    user: string;
    title: string;
    description: string;
    substance_type: SubstanceType;
    target_value: number;
    target_unit: string;
    current_value: number;
    start_date: string;
    end_date: string;
    duration: string;
    status: 'active' | 'paused' | 'completed' | 'failed' | 'abandoned';
    progress: number;
    benefits: string[];
    challenge: string;
    last_updated?: string;
}
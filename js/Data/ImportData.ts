interface MigrationFlow {
    estimate: number;
    state: string;
    moe: number | string; // TODO Find which one
}

interface RawData {
    came_from: MigrationFlow[];
    left_to: MigrationFlow[];
    net_immigration_flow: number;
    population: number;
    state: string;
    total_came: number;
    total_left: number;
}

export interface Year {
    data: RawData[];
    year: number;
}
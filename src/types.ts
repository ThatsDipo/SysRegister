// TODO: Define better types for the application, currenlty a mess.

export type Subject = {
    name: string;
    marks: number[];
}

export type Mark = {
    type: string;
    affectsAverage: boolean;
    date: string;
    value: string;
    note: string;
}

export type MarkData = { name: string; data: Subject[] }[];

export type MarkResponse = {name: string, data: MarkData[]}[];
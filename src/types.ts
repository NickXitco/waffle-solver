export enum LetterState {
	GREY,
	YELLOW,
	GREEN,
	UNKNOWN,
}

export const StateColors = {
	Grey: '#edeff1',
	Green: '#6fb05c',
	Yellow: '#e9ba3a',
	Unknown: '#3a80e8',
}

export interface Letter {
	index: number
	state: LetterState
	letter: string
}

export interface LetterWithWordPos extends Letter {
	pos: number
}

export enum Mode {
	INPUT,
	COLORING,
}
